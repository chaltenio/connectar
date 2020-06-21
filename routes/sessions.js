const express = require('express');

const {
  getSessions,
  getSession,
  addSession,
  updateSession,
  deleteSession,
} = require('../controllers/sessions');

const Session = require('../models/Session');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(
    advancedResults(Session, {
      path: 'bootcamp',
      select: 'name description',
    }),
    getSessions
  )
  .post(protect, authorize('publisher', 'admin'), addSession);
  
router
  .route('/:id')
  .get(getSession)
  .put(protect, authorize('publisher', 'admin'), updateSession)
  .delete(protect, authorize('publisher', 'admin'), deleteSession);

module.exports = router;
