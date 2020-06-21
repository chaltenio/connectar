const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Session = require('../models/Session');
const Bootcamp = require('../models/Bootcamp');

// @desc    Get sessions
// @route   GET /api/v1/sessions
// @route   GET /api/v1/bootcamps/:bootcampId/sessions
// @access  Public
exports.getSessions = asyncHandler(async (req, res, next) => {
    if(req.params.bootcampId) {
        const sessions = await Session.find({ bootcamp: req.params.bootcampId });

        return res.status(200).json({
            succes: true,
            count: sessions.length,
            data: sessions
        });
    } else {
        res.status(200).json(res.advancedResults)
    }    
});


// @desc    Get single session
// @route   GET /api/v1/sessions/:id
// @access  Public
exports.getSession = asyncHandler(async (req, res, next) => {
    const session = await Session.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if(!session) {
        return next(new ErrorResponse(`No session with the id of ${req.params.id}`), 404);
    }

    res.status(200).json({ 
        success: true,
        data: session
    });
    
});


// @desc    Add session
// @route   POST /api/v1/bootcamps/:bootcampId/sessions
// @access  Private
exports.addSession = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) {
      return next(
        new ErrorResponse(
          `No bootcamp with the id of ${req.params.bootcampId}`
        ),
        404
      );
    }

    // Make sure user is session owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to add a session to bootcamp ${bootcamp._id}`,
          401
        )
      );
    }    

    const session = await Session.create(req.body);

    res.status(200).json({ 
        success: true,
        data: session
    });
    
});


// @desc    Update session
// @route   PUT /api/v1/sessions/:id
// @access  Private
exports.updateSession = asyncHandler(async (req, res, next) => {
    let session = await Session.findById(req.params.id);

    if (!session) {
      return next(
        new ErrorResponse(`No session with the id of ${req.params.id}`),
        404
      );
    }


    // Make sure user is session owner
    if (session.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
          new ErrorResponse(
            `User ${req.user.id} is not authorized to update session ${session._id}`,
            401
          )
        );
    }  

    session = await Session.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({ 
        success: true,
        data: session
    });
    
});


// @desc    Delete session
// @route   DELETE /api/v1/sessions/:id
// @access  Private
exports.deleteSession = asyncHandler(async (req, res, next) => {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return next(
        new ErrorResponse(`No session with the id of ${req.params.id}`),
        404
      );
    }

    // Make sure user is session owner
    if (session.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
          new ErrorResponse(
            `User ${req.user.id} is not authorized to delete session ${session._id}`,
            401
          )
        );
    }  

    await session.remove();

    res.status(200).json({ 
        success: true,
        data: {}
    });
    
});