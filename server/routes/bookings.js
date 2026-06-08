// const router = require('express').Router();
// const { protect, optionalAuth, requireRole } = require('../middleware/auth');
// const c = require('../controllers/bookingController');
// router.post('/', optionalAuth, c.createBooking);
// router.get('/', protect, c.getBookings);
// router.get('/:id', protect, c.getBooking);
// router.patch('/:id', protect, c.updateBookingStatus);
// module.exports = router;


const router = require('express').Router();
const { protect, requireRole } = require('../middleware/auth');
const c = require('../controllers/bookingController');

router.post('/', protect, requireRole('customer'), c.createBooking);
router.get('/', protect, c.getBookings);
router.get('/:id', protect, c.getBooking);
router.patch('/:id', protect, c.updateBookingStatus);

module.exports = router;