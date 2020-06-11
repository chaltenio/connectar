const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const Event = require('../models/Event');

// @desc    Get all events
// @route   GET /api/v1/events
// @access  Public
exports.getEvents = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get a single event
// @route   GET /api/v1/events/:id
// @access  Public
exports.getEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(
      new ErrorResponse(`Event not found with ID of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: event });
});

// @desc    Create new event
// @route   POST /api/v1/events
// @access  Private
exports.createEvent = asyncHandler(async (req, res, next) => {
  // Add user to req, body
  req.body.user = req.user.id;

  // Check for published event
  const publishedEvent = await Event.findOne({ user: req.user.id });

  // If the user is not ad admin, they can only add one event
  if (publishedEvent && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `The user with ID ${req.user.id} has already published a event`,
        400
      )
    );
  }

  const event = await Event.create(req.body);

  res.status(201).json({
    success: true,
    data: event,
  });
});

// @desc    Update event
// @route   PUT /api/v1/events/:id
// @access  Private
exports.updateEvent = asyncHandler(async (req, res, next) => {
  let event = await Event.findById(req.params.id);

  if (!event) {
    return next(
      new ErrorResponse(`Event not found with ID of ${req.params.id}`, 404)
    );
  }

  // Make sure user is event owner
  if (event.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to update this event`,
        401
      )
    );
  }

  event =  await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: event });
});

// @desc    Delete event
// @route   DELETE /api/v1/events/:id
// @access  Private
exports.deleteEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(
      new ErrorResponse(`Event not found with ID of ${req.params.id}`, 404)
    );
  }

 // Make sure user is event owner
 if (event.user.toString() !== req.user.id && req.user.role !== 'admin') {
   return next(
     new ErrorResponse(
       `User ${req.params.id} is not authorized to delete this event`,
       401
     )
   );
 }


  event.remove();

  res.status(200).json({ success: true, data: {} });
});

// @desc    Get events withing a radius
// @route   GET /api/v1/events/radius/:zipcode/:distance
// @access  Private
exports.getEventsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc radius using radians
  // Divide distance by radius of Earth
  // Earth Radius = 3,963 mi / 6,378 Kms
  const radius = distance / 3963;

  const events = await Event.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    success: true,
    count: events.length,
    data: events,
  });
});


// @desc    Upload photo for event
// @route   PUT /api/v1/events/:id/photo
// @access  Private
exports.eventPhotoUpload = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(
      new ErrorResponse(`Event not found with ID of ${req.params.id}`, 404)
    );
  }

  // Make sure user is event owner
  if (event.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to update this event`,
        401
      )
    );
  }

  if(!req.files) {
    return next(
      new ErrorResponse(`Please upload a file`, 400)
    );
  }

  const file = req.files.file;

  // Make sure the image is a photo
  if(!file.mimetype.startsWith('image')){
    return next(
      new ErrorResponse(`Please upload an image file`, 400)
    );
  }

  //Check filesize
  if(file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400)
    );
  }

  // Create custom filename
  file.name = `photo_${event._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if(err){
      console.error(err);
      return next(
        new ErrorResponse(`Problem with file upload`, 500)
      );
    }

    await Event.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name
    });

  });
});