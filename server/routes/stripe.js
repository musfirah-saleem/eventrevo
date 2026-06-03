const express = require('express');
const router = require('express').Router();
const { protect } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');
const DJProfile = require('../models/DJProfile');
const Transaction = require('../models/Transaction');

const toMajorAmount = (amountCents) => (Number(amountCents || 0) / 100) || 0;

const upsertTransactionFromPaymentIntent = async ({ paymentIntent, booking, eventId, fallbackStatus }) => {
  if (!paymentIntent || !booking) return;

  const latestCharge =
    paymentIntent.latest_charge && typeof paymentIntent.latest_charge === 'object'
      ? paymentIntent.latest_charge
      : null;

  const status =
    fallbackStatus ||
    (paymentIntent.status === 'requires_payment_method' && paymentIntent.last_payment_error
      ? 'failed'
      : paymentIntent.status);

  await Transaction.findOneAndUpdate(
    { paymentIntentId: paymentIntent.id },
    {
      booking: booking._id,
      customer: booking.customer,
      djProfile: booking.djProfile,
      paymentIntentId: paymentIntent.id,
      chargeId: latestCharge?.id || '',
      stripeEventId: eventId || '',
      type: paymentIntent.metadata?.paymentStage || paymentIntent.metadata?.type || 'unknown',
      status: status || 'processing',
      amount: toMajorAmount(paymentIntent.amount_received || paymentIntent.amount || 0),
      currency: String(paymentIntent.currency || 'aud').toLowerCase(),
      paymentMethodType: paymentIntent.payment_method_types?.[0] || '',
      receiptUrl: latestCharge?.receipt_url || '',
      failureMessage: paymentIntent.last_payment_error?.message || '',
      stripeCreatedAt: paymentIntent.created ? new Date(paymentIntent.created * 1000) : undefined,
      processedAt: new Date(),
      metadata: paymentIntent.metadata || {},
    },
    { upsert: true, new: true }
  );
};

// Create payment intent for deposit
router.post('/create-payment-intent', protect, async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId).populate({
      path: 'djProfile',
      select: 'stageName minimumAdvanceAmount',
    });
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });
    if (!booking.customer.equals(req.user.id)) return res.status(403).json({ success: false, error: 'Forbidden' });

    const minAdvanceAmount = Number(booking.djProfile?.minimumAdvanceAmount || 0);
    const baseDepositAmount = booking.totalAmount * (Number(booking.depositPercentage || 0) / 100);
    const requiredDepositAmount = Math.max(baseDepositAmount, minAdvanceAmount);
    const isMinimumAdvance = minAdvanceAmount > 0 && Math.abs(requiredDepositAmount - minAdvanceAmount) <= 0.0001;

    if (booking.paymentStatus === 'fully_paid') {
      return res.status(400).json({ success: false, error: 'Booking is already fully paid' });
    }
    if (booking.paymentStatus === 'deposit_paid') {
      return res.status(400).json({ success: false, error: 'Advance already paid. Please pay remaining amount.' });
    }

    if (!requiredDepositAmount || requiredDepositAmount <= 0) {
      return res
        .status(400)
        .json({ success: false, error: 'Required deposit must be greater than zero' });
    }

    // Keep booking in sync with any newly applied minimum rules.
    if (Math.abs((booking.depositAmount || 0) - requiredDepositAmount) > 0.0001) {
      await Booking.findByIdAndUpdate(bookingId, { depositAmount: requiredDepositAmount });
    }

    const depositCents = Math.round(requiredDepositAmount * 100);
    const intent = await stripe.paymentIntents.create({
      amount: depositCents,
      currency: 'aud',
      metadata: {
        bookingId: bookingId.toString(),
        type: 'deposit',
        paymentStage: 'deposit',
        djName: booking.djProfile.stageName,
        minAdvanceAmount: String(minAdvanceAmount),
        depositPercentage: String(booking.depositPercentage || 0),
      },
    });
    await Booking.findByIdAndUpdate(bookingId, { stripePaymentIntentId: intent.id });
    res.json({
      success: true,
      clientSecret: intent.client_secret,
      depositAmount: requiredDepositAmount,
      depositPercentage: booking.depositPercentage || 0,
      minimumAdvanceAmount: minAdvanceAmount,
      isMinimumAdvance,
      paymentStage: 'deposit',
    });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// Create payment intent for remaining balance
router.post('/create-remaining-payment-intent', protect, async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId).populate({
      path: 'djProfile',
      select: 'stageName',
    });
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });
    if (!booking.customer.equals(req.user.id)) return res.status(403).json({ success: false, error: 'Forbidden' });

    if (booking.paymentStatus === 'fully_paid') {
      return res.status(400).json({ success: false, error: 'Booking is already fully paid' });
    }
    if (booking.paymentStatus === 'unpaid') {
      return res.status(400).json({ success: false, error: 'Please pay advance first' });
    }

    const paidSoFar = Number(booking.amountPaid || booking.depositAmount || 0);
    const remainingAmount = Math.max(Number(booking.totalAmount || 0) - paidSoFar, 0);
    if (remainingAmount <= 0) {
      return res.status(400).json({ success: false, error: 'No remaining amount due' });
    }

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(remainingAmount * 100),
      currency: 'aud',
      metadata: {
        bookingId: bookingId.toString(),
        type: 'remaining',
        paymentStage: 'remaining',
        djName: booking.djProfile.stageName,
      },
    });

    await Booking.findByIdAndUpdate(bookingId, {
      stripePaymentIntentId: intent.id,
      stripeFinalPaymentIntentId: intent.id,
      remainingAmount,
    });

    res.json({
      success: true,
      clientSecret: intent.client_secret,
      paymentStage: 'remaining',
      remainingAmount,
      amountPaid: paidSoFar,
      totalAmount: booking.totalAmount || 0,
    });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// Transaction history
router.get('/transactions', protect, async (req, res) => {
  try {
    const { bookingId, page = 1, limit = 20 } = req.query;
    const query = {};

    if (bookingId) query.booking = bookingId;

    if (req.user.role === 'customer') {
      query.customer = req.user.id;
    } else if (req.user.role === 'dj') {
      const dj = await DJProfile.findOne({ user: req.user.id }).select('_id');
      if (!dj) return res.json({ success: true, data: [], total: 0, page: Number(page), pages: 0 });
      query.djProfile = dj._id;
    }
    // admin can read all

    const numericPage = Math.max(Number(page) || 1, 1);
    const numericLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const skip = (numericPage - 1) * numericLimit;

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .populate('booking', 'eventType eventDate totalAmount paymentStatus')
        .populate('customer', 'name email')
        .populate('djProfile', 'stageName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(numericLimit),
      Transaction.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: transactions,
      total,
      page: numericPage,
      pages: Math.ceil(total / numericLimit),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch transactions' });
  }
});

// Webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) { return res.status(400).json({ error: 'Webhook error' }); }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    if (pi.metadata?.bookingId) {
      const booking = await Booking.findById(pi.metadata.bookingId);
      if (!booking) return res.json({ received: true });

      const paidAmount = (Number(pi.amount_received || 0) / 100) || 0;
      const totalAmount = Number(booking.totalAmount || 0);
      const paymentStage = pi.metadata?.paymentStage || pi.metadata?.type || 'deposit';

      if (paymentStage === 'remaining') {
        await Booking.findByIdAndUpdate(pi.metadata.bookingId, {
          paymentStatus: 'fully_paid',
          amountPaid: totalAmount,
          remainingAmount: 0,
          lastPaymentAt: new Date(),
          stripeFinalPaymentIntentId: pi.id,
        });
      } else {
        const amountPaid = Math.max(Number(booking.amountPaid || 0), paidAmount, Number(booking.depositAmount || 0));
        const remainingAmount = Math.max(totalAmount - amountPaid, 0);
        await Booking.findByIdAndUpdate(pi.metadata.bookingId, {
          paymentStatus: remainingAmount <= 0 ? 'fully_paid' : 'deposit_paid',
          amountPaid: remainingAmount <= 0 ? totalAmount : amountPaid,
          remainingAmount,
          lastPaymentAt: new Date(),
          stripeDepositId: pi.id,
        });
      }
      await upsertTransactionFromPaymentIntent({
        paymentIntent: pi,
        booking,
        eventId: event.id,
      });
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object;
    if (pi.metadata?.bookingId) {
      const booking = await Booking.findById(pi.metadata.bookingId);
      if (booking) {
        await upsertTransactionFromPaymentIntent({
          paymentIntent: pi,
          booking,
          eventId: event.id,
          fallbackStatus: 'failed',
        });
      }
    }
  }
  res.json({ received: true });
});

module.exports = router;
