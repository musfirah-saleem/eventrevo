// server/controllers/bookingController.js
const Booking = require('../models/Booking');
const DJProfile = require('../models/DJProfile');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { sendBookingRequestEmail, sendBookingConfirmedEmail, sendBookingDeclinedEmail } = require('../utils/email');
const { createCalendarEvent, deleteCalendarEvent } = require('../utils/googleCalendar');

const reconcilePaymentTracking = async (booking) => {
  if (!booking) return booking;

  const totalAmount = Number(booking.totalAmount || 0);
  let amountPaid = Number(booking.amountPaid || 0);
  let remainingAmount = Number(booking.remainingAmount || 0);

  // Fallback safety: if webhook was missed but a PaymentIntent exists,
  // verify with Stripe directly and repair status.
  if (
    booking.paymentStatus === 'unpaid' &&
    booking.stripePaymentIntentId &&
    Number(booking.amountPaid || 0) === 0
  ) {
    try {
      const intent = await stripe.paymentIntents.retrieve(booking.stripePaymentIntentId);
      if (intent?.status === 'succeeded') {
        const paidFromStripe = Number(intent.amount_received || 0) / 100;
        const inferredRemaining = Math.max(totalAmount - paidFromStripe, 0);
        booking.paymentStatus = inferredRemaining <= 0 ? 'fully_paid' : 'deposit_paid';
        booking.amountPaid = inferredRemaining <= 0 ? totalAmount : paidFromStripe;
        booking.remainingAmount = inferredRemaining;
        booking.lastPaymentAt = new Date();
        if (booking.paymentStatus === 'deposit_paid') {
          booking.stripeDepositId = intent.id;
        } else {
          booking.stripeFinalPaymentIntentId = intent.id;
        }
        await booking.save();
      }
    } catch (err) {
      // Keep reconciliation non-blocking for list/detail calls.
      console.error('Stripe intent reconciliation failed:', err.message);
    }
  }

  if (booking.paymentStatus === 'fully_paid') {
    amountPaid = totalAmount;
    remainingAmount = 0;
  } else if (booking.paymentStatus === 'deposit_paid') {
    if (amountPaid <= 0) {
      amountPaid = Number(booking.depositAmount || 0);
    }
    remainingAmount = Math.max(totalAmount - amountPaid, 0);
  } else if (booking.paymentStatus === 'unpaid') {
    amountPaid = 0;
    remainingAmount = totalAmount;
  }

  const shouldUpdate =
    Math.abs(Number(booking.amountPaid || 0) - amountPaid) > 0.0001 ||
    Math.abs(Number(booking.remainingAmount || 0) - remainingAmount) > 0.0001;

  if (shouldUpdate) {
    booking.amountPaid = amountPaid;
    booking.remainingAmount = remainingAmount;
    await booking.save();
  }

  return booking;
};

// POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const { djProfileId, eventType, eventDate, startTime, endTime, location, notes, guestCount, guestName, guestEmail } = req.body;

    const dj = await DJProfile.findById(djProfileId).populate('user', 'name email');
    if (!dj || dj.status !== 'approved') return res.status(404).json({ success: false, error: 'DJ not available' });

    // Availability check: ensure requested date/time is within DJ weeklyAvailability
    const toMinutes = t => {
      const [h, m] = (t || '').split(':').map(Number);
      return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : NaN;
    };

    const normalizeDateStr = d => {
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return null;
      const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000);
      return local.toISOString().slice(0, 10);
    };

    const checkAvailability = (djProfile, eventDateStr, reqStart, reqEnd) => {
      // blockedDates
      const normalizedEvent = normalizeDateStr(eventDateStr);
      if (!normalizedEvent) return { ok: false, message: 'Invalid event date' };

      if (Array.isArray(djProfile.blockedDates)) {
        const blocked = djProfile.blockedDates.some(b => {
          try {
            const bstr = normalizeDateStr(b.date || b);
            return bstr === normalizedEvent;
          } catch (e) { return false; }
        });
        if (blocked) return { ok: false, message: 'DJ has blocked this date' };
      }

      const dateObj = new Date(eventDateStr + 'T00:00:00');
      if (Number.isNaN(dateObj.getTime())) return { ok: false, message: 'Invalid event date' };
      const day = dateObj.getDay(); // 0-6

      const reqS = toMinutes(reqStart);
      const reqE = toMinutes(reqEnd);
      if (!Number.isFinite(reqS) || !Number.isFinite(reqE)) return { ok: false, message: 'Invalid start/end time' };

      let reqStartAbs = reqS;
      let reqEndAbs = reqE;
      if (reqEndAbs <= reqStartAbs) reqEndAbs += 24 * 60; // overnight booking

      const weekly = Array.isArray(djProfile.weeklyAvailability) ? djProfile.weeklyAvailability : [];
      const daySchedule = weekly.find(w => Number(w.dayOfWeek) === Number(day));
      const prevSchedule = weekly.find(w => Number(w.dayOfWeek) === ((Number(day) + 6) % 7));

      const withinSchedule = schedule => {
        if (!schedule || !schedule.isAvailable) return false;
        const s = toMinutes(schedule.startTime);
        const e = toMinutes(schedule.endTime);
        if (!Number.isFinite(s) || !Number.isFinite(e)) return false;
        let sAbs = s;
        let eAbs = e;
        if (eAbs <= sAbs) eAbs += 24 * 60; // overnight availability

        // For same-day schedule we compare against request times anchored to the same day
        return reqStartAbs >= sAbs && reqEndAbs <= eAbs;
      };

      if (withinSchedule(daySchedule)) return { ok: true };

      // Check previous day's spill-over (e.g., Fri 18:00-02:00 covering Sat 01:00)
      if (prevSchedule && prevSchedule.isAvailable) {
        const ps = toMinutes(prevSchedule.startTime);
        const pe = toMinutes(prevSchedule.endTime);
        if (Number.isFinite(ps) && Number.isFinite(pe)) {
          let psAbs = ps;
          let peAbs = pe;
          if (peAbs <= psAbs) peAbs += 24 * 60; // overnight

          // The portion that falls on eventDate is minutes >= 24*60 in the prev schedule
          if (peAbs > 24 * 60) {
            const spillStartOnEvent = Math.max(psAbs, 24 * 60) - 24 * 60; // e.g. 0..pe-24*60
            const spillEndOnEvent = peAbs - 24 * 60;

            if (reqStartAbs >= spillStartOnEvent && reqEndAbs <= spillEndOnEvent) {
              return { ok: true };
            }
          }
        }
      }

      return { ok: false, message: 'DJ is not available at the requested date/time' };
    };

    const availCheck = checkAvailability(dj, eventDate, startTime, endTime);
    if (!availCheck.ok) return res.status(400).json({ success: false, error: availCheck.message });

    // Calculate duration
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    let duration = (eh + em / 60) - (sh + sm / 60);
    if (duration <= 0) duration += 24; // handle overnight

    if (duration < dj.minimumHours) {
      return res.status(400).json({ success: false, error: `Minimum booking is ${dj.minimumHours} hours` });
    }

    const totalAmount = dj.hourlyRate * duration;
    const fallbackDepositPercentage = Number(process.env.DEPOSIT_PERCENTAGE || 20);
    const depositPercentage =
      dj.advanceBookingPercentage && dj.advanceBookingPercentage > 0
        ? dj.advanceBookingPercentage
        : fallbackDepositPercentage;
    const depositAmountByPercent = totalAmount * (depositPercentage / 100);
    const minimumAdvanceAmount = Number(dj.minimumAdvanceAmount || 0);
    const depositAmount = Math.max(depositAmountByPercent, minimumAdvanceAmount);

    const bookingData = {
      djProfile: djProfileId,
      eventType, eventDate: new Date(eventDate), startTime, endTime, duration,
      location, notes, guestCount,
      quotedRate: dj.hourlyRate,
      totalAmount, depositAmount, depositPercentage,
      amountPaid: 0,
      remainingAmount: totalAmount,
    };

    // Attach customer or guest
    if (req.user) {
      bookingData.customer = req.user.id;
    } else {
      if (!guestName || !guestEmail) {
        return res.status(400).json({ success: false, error: 'Guest name and email required' });
      }
      // Create a guest user record
      let guestUser = await User.findOne({ email: guestEmail });
      if (!guestUser) {
        guestUser = await User.create({ name: guestName, email: guestEmail, role: 'customer', emailVerified: false });
      }
      bookingData.customer = guestUser._id;
      bookingData.guestName = guestName;
      bookingData.guestEmail = guestEmail;
    }

    const booking = await Booking.create(bookingData);
    await DJProfile.findByIdAndUpdate(djProfileId, { $inc: { totalBookings: 1 } });

    // Email DJ
    try {
      await sendBookingRequestEmail({
        djEmail: dj.user.email, djName: dj.stageName,
        customerName: req.user?.name || guestName,
        eventType, eventDate: new Date(eventDate).toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        location, bookingId: booking._id.toString(),
      });
    } catch (e) { console.error('Email failed:', e.message); }

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ success: false, error: 'Failed to create booking' });
  }
};

// GET /api/bookings — role-based list
exports.getBookings = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'customer') {
      query.customer = req.user.id;
    } else if (req.user.role === 'dj') {
      const dj = await DJProfile.findOne({ user: req.user.id });
      if (!dj) return res.json({ success: true, data: [] });
      query.djProfile = dj._id;
    }
    // admin: no filter (all bookings)

    const bookings = await Booking.find(query)
      .populate('customer', 'name email phone avatar')
      .populate({ path: 'djProfile', populate: { path: 'user', select: 'name email' } })
      .sort({ createdAt: -1 });

    await Promise.all(bookings.map(reconcilePaymentTracking));
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
  }
};

// GET /api/bookings/:id
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate({ path: 'djProfile', populate: { path: 'user', select: 'name email' } });
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });
    await reconcilePaymentTracking(booking);
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch booking' });
  }
};

// PATCH /api/bookings/:id — confirm / decline / cancel / complete
exports.updateBookingStatus = async (req, res) => {
  try {
    const { action } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name email')
      .populate({ path: 'djProfile', select: '+googleAccessToken +googleRefreshToken', populate: { path: 'user', select: 'name email' } });

    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });

    // Authorization
    if (req.user.role === 'dj') {
      const dj = await DJProfile.findOne({ user: req.user.id });
      if (!booking.djProfile._id.equals(dj._id)) return res.status(403).json({ success: false, error: 'Forbidden' });
    } else if (req.user.role === 'customer') {
      if (!booking.customer._id.equals(req.user.id)) return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    if (action === 'confirm') {
      booking.status = 'confirmed';
      booking.confirmedAt = new Date();

      // Google Calendar sync
      if (booking.djProfile.googleAccessToken) {
        try {
          const event = await createCalendarEvent({
            accessToken: booking.djProfile.googleAccessToken,
            refreshToken: booking.djProfile.googleRefreshToken,
            summary: `🎧 ${booking.eventType} — ${booking.customer.name}`,
            description: `Booked via EventRevo\nCustomer: ${booking.customer.name}\nLocation: ${booking.location}\n${booking.notes}`,
            startDateTime: `${booking.eventDate.toISOString().split('T')[0]}T${booking.startTime}:00`,
            endDateTime: `${booking.eventDate.toISOString().split('T')[0]}T${booking.endTime}:00`,
            location: booking.location,
          });
          booking.googleEventId = event.id;
        } catch (e) { console.error('Calendar sync failed:', e.message); }
      }

      await booking.save();

      // Email customer
      try {
        await sendBookingConfirmedEmail({
          customerEmail: booking.customer.email, customerName: booking.customer.name,
          djStageName: booking.djProfile.stageName,
          eventType: booking.eventType,
          eventDate: booking.eventDate.toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
          location: booking.location, bookingId: booking._id.toString(),
          depositAmount: booking.depositAmount,
        });
      } catch (e) { console.error('Email failed:', e.message); }

    } else if (action === 'decline') {
      booking.status = 'declined';
      booking.declinedAt = new Date();
      await booking.save();
      try {
        await sendBookingDeclinedEmail({
          customerEmail: booking.customer.email, customerName: booking.customer.name,
          djStageName: booking.djProfile.stageName,
          eventDate: booking.eventDate.toLocaleDateString('en-AU'),
        });
      } catch (e) { }

    } else if (action === 'cancel') {
      booking.status = 'cancelled';
      if (booking.googleEventId && booking.djProfile.googleAccessToken) {
        try {
          await deleteCalendarEvent({ accessToken: booking.djProfile.googleAccessToken, eventId: booking.googleEventId });
        } catch (e) { }
      }
      await booking.save();

    } else if (action === 'complete') {
      booking.status = 'completed';
      booking.completedAt = new Date();
      await booking.save();
    } else {
      return res.status(400).json({ success: false, error: 'Invalid action' });
    }

    res.json({ success: true, data: booking });
  } catch (err) {
    console.error('Booking update error:', err);
    res.status(500).json({ success: false, error: 'Failed to update booking' });
  }
};
