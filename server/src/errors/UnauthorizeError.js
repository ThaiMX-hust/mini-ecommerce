const { AppError } = require('./AppError')

class UnauthorizeError extends AppError{
    constructor(message = "Unauthorized", statusCode = 401) {
      super(message, statusCode);
    }
}

module.exports = {
  UnauthorizeError
}