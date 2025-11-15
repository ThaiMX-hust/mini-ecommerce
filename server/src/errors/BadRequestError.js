class BadRequestError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode || 500;
    Error.captureStackTrace(this, this.constructor);
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