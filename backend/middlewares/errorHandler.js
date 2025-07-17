const errorHandler = (err, req, res, next) => {
  console.error('Error caught by middleware:', err);
  console.error('Error stack:', err.stack);

  // Default error response
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors = null;

  // Handle different types of errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = err.errors;
  } else if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Database Validation Error';
    errors = err.errors.map(e => e.message);
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    message = 'Duplicate entry error';
    errors = err.errors.map(e => `${e.path}: ${e.message}`);
  } else if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Foreign key constraint error';
  } else if (err.name === 'SequelizeDatabaseError') {
    statusCode = 500;
    message = 'Database error';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.status) {
    statusCode = err.status;
    message = err.message;
  } else if (err.message) {
    message = err.message;
  }

  // Don't expose sensitive error details in production
  const response = {
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err 
    })
  };

  res.status(statusCode).json(response);
};

export default errorHandler;