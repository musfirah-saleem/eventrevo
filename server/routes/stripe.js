const express = require('express');
const router = require('express').Router();
const { protect } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');

// Create payment intent for deposit
router.post('/create-payment-intent', protect, async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId).populate({ path:'djProfile', select:'stageName' });
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });
    if (!booking.customer.equals(req.user.id)) return res.status(403).json({ success: false, error: 'Forbidden' });

    const depositCents = Math.round(booking.depositAmount * 100);
    const intent = await stripe.paymentIntents.create({
      amount: depositCents,
      currency: 'aud',
      metadata: { bookingId: bookingId.toString(), type: 'deposit', djName: booking.djProfile.stageName },
    });
    await Booking.findByIdAndUpdate(bookingId, { stripePaymentIntentId: intent.id });
    res.json({ success: true, clientSecret: intent.client_secret, depositAmount: booking.depositAmount });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
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
      await Booking.findByIdAndUpdate(pi.metadata.bookingId, { paymentStatus: 'deposit_paid' });
    }
  }
  res.json({ received: true });
});

module.exports = router;
