const { AppError } = require('./AppError')

class UnauthorizeError extends AppError{
    constructor(message = "Unauthorized") {
      super(message, 401);
    }
}

module.exports = {
  UnauthorizeError
}