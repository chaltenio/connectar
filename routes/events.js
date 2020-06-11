const express = require('express');

const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsInRadius,
  eventPhotoUpload
} = require('../controllers/events');

const Event = require('../models/Event');

// Include other resource routers
const sessionRouter = require('./sessions');
const feedbackRouter = require('./feedbacks');

const router = express.Router();

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:eventId/sessions', sessionRouter);
router.use('/:eventId/feedbacks', feedbackRouter);

router.route('/radius/:zipcode/:distance').get(getEventsInRadius);

router.route('/:id/photo').put(protect, authorize('publisher', 'admin'), eventPhotoUpload);

router
  .route('/')
  .get(advancedResults(Event, 'events'), getEvents)
  .post(protect, authorize('publisher', 'admin'), createEvent);

router
  .route('/:id')
  .get(getEvent)
  .put(protect, authorize('publisher', 'admin'), updateEvent)
  .delete(protect, authorize('publisher', 'admin'), deleteEvent);

module.exports = router;