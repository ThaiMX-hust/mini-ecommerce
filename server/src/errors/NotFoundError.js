const { AppError } = require('./AppError')

class NotFoundError extends AppError{
    constructor(message = 'Not Found', statusCode = 404) {
      super(message, statusCode);
    }
}

module.exports = {
  NotFoundError
}