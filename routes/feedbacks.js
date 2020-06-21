const express = require('express');
const {
  getFeedbacks,
  getFeedback,
  addFeedback,
  updateFeedback,
  deleteFeedback
} = require('../controllers/feedbacks');

const Feedback = require('../models/Feedback');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(
    advancedResults(Feedback, {
      path: 'bootcamp',
      select: 'name description',
    }),
    getFeedbacks
  ).post(protect, authorize('user', 'admin'), addFeedback);

  router
    .route('/:id')
    .get(getFeedback)
    .put(protect, authorize('user', 'admin'), updateFeedback)
    .delete(protect, authorize('user', 'admin'), deleteFeedback);
  
module.exports = router;
