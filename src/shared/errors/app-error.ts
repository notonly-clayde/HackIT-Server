export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
  ) {
    super(message)
    this.name = this.constructor.name
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401)
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(message, 404)
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, 400)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403)
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = "Service unavailable") {
    super(message, 503)
  }
}

export class BadGatewayError extends AppError {
  constructor(message = "Bad gateway") {
    super(message, 502)
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = "Too many requests") {
    super(message, 429)
  }
}
