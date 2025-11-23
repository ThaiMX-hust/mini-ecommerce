const { AppError } = require('./AppError')

class BadRequestError extends AppError {
  constructor(message = "Bad Request") {
    super(message, 400);
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