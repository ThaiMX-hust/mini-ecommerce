const { AppError } = require('./AppError');

class BadRequestError extends AppError {
  constructor(message = "Bad Request") {
    super(message, 400);
  }
}

class EmptyCartError extends BadRequestError {
  constructor(message) {
    super(message);
  }
}

class OutOfStockError extends BadRequestError {
  constructor(message) {
    super(message);
  }
}


module.exports = {
  BadRequestError,
  EmptyCartError,
  OutOfStockError
};
