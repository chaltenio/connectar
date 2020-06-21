const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Feedback = require('../models/Feedback');
const Bootcamp = require('../models/Bootcamp');

// @desc    Get feedbacks
// @route   GET /api/v1/feedbacks
// @route   GET /api/v1/events/:eventId/feedbacks
// @access  Public
exports.getFeedbacks = asyncHandler(async (req, res, next) => {
    if(req.params.eventId) {
        const feedbacks = await Feedback.find({ event: req.params.eventId });

        return res.status(200).json({
            succes: true,
            count: feedbacks.length,
            data: feedbacks
        });
    } else {
        res.status(200).json(res.advancedResults)
    }    
});


// @desc    Get single feedback
// @route   GET /api/v1/feedbacks/:id
// @access  Public
exports.getFeedback = asyncHandler(async (req, res, next) => {
    const feedback = await Feedback.findById(req.params.id).populate({
        path: 'event',
        select: 'name description'
    });

    if (!feedback) {
      return next(
        new ErrorResponse(`No feedback found with the id of ${req.params.id}`, 404),        
      );
    }

    res.status(200).json({
      succes: true,
      data: feedback,
    });
});


// @desc    Add feedback
// @route   POST /api/v1/events/:eventId/feedbacks
// @access  Private
exports.addFeedback = asyncHandler(async (req, res, next) => {
  req.body.event = req.params.eventId;
  req.body.user = req.user.id;

  const event = await Bootcamp.findById(req.params.eventId);

  if (!event) {
    return next(
      new ErrorResponse(
        `No event with the id of ${req.params.eventId}`,
        404
      )
    );
  }

  try {
    const feedback = await Feedback.create(req.body);

    res.status(201).json({
      succes: true,
      data: feedback,
    });    
  } catch (err) {
    console.log(err.message);
    res.status(400).json({
      success: false,
      data: 'Duplicate feedback',
    });    
  }

});

// @desc    Update feedback
// @route   PUT /api/v1/feedbacks/:id
// @access  Private
exports.updateFeedback = asyncHandler(async (req, res, next) => {  
  let feedback = await Feedback.findById(req.params.id);

  if (!feedback) {
    return next(
      new ErrorResponse(
        `No feedback with the id of ${req.params.id}`,
        404
      )
    );
  }

  // Make sure feedback belongs to user or user is admin
  if (feedback.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `Not authorized to update feedback`,
        401
      )
    );
  }

  feedback = await Feedback.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    succes: true,
    data: feedback,
  });
});


// @desc    Delete feedback
// @route   DELETE /api/v1/feedbacks/:id
// @access  Private
exports.deleteFeedback = asyncHandler(async (req, res, next) => {  
  const feedback = await Feedback.findById(req.params.id);

  if (!feedback) {
    return next(
      new ErrorResponse(
        `No feedback with the id of ${req.params.id}`,
        404
      )
    );
  }

  // Make sure feedback belongs to user or user is admin
  if (feedback.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `Not authorized to update feedback`,
        401
      )
    );
  }

  await feedback.remove();

  res.status(200).json({
    succes: true,
    data: {},
  });
});