// @desc    Logs request to console

// creating a Middleware.
// all Middleware functions will have 3 params.
const logger = (req, res, next) => {
  console.log(
    `${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`
  );
  next();
};

module.exports = logger;
