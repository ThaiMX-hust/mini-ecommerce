const { AppError } = require('./AppError')

class BadRequestError extends AppError {
  constructor(message = "Bad Request", statusCode = 400) {
    super(message, statusCode);
  }
}

class EmptyCartError extends BadRequestError {
    constructor(message, statusCode){
        super(message, statusCode)
    }
}

class OutOfStockError extends BadRequestError {
  constructor(message, statusCode) {
    super(message, statusCode);
  }
}


module.exports = {
    BadRequestError,
    EmptyCartError,
    OutOfStockError
}