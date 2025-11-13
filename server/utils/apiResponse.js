// Standard API response format
class ApiResponse {
  constructor(success, message, data = null, statusCode = 200) {
    this.success = success;
    this.message = message;
    if (data !== null) {
      this.data = data;
    }
    this.statusCode = statusCode;
  }

  static success(res, message, data = null, statusCode = 200) {
    return res.status(statusCode).json(new ApiResponse(true, message, data, statusCode));
  }

  static error(res, message, statusCode = 500, data = null) {
    return res.status(statusCode).json(new ApiResponse(false, message, data, statusCode));
  }

  static created(res, message, data = null) {
    return res.status(201).json(new ApiResponse(true, message, data, 201));
  }

  static badRequest(res, message, data = null) {
    return res.status(400).json(new ApiResponse(false, message, data, 400));
  }

  static unauthorized(res, message = 'Unauthorized access') {
    return res.status(401).json(new ApiResponse(false, message, null, 401));
  }

  static forbidden(res, message = 'Access forbidden') {
    return res.status(403).json(new ApiResponse(false, message, null, 403));
  }

  static notFound(res, message = 'Resource not found') {
    return res.status(404).json(new ApiResponse(false, message, null, 404));
  }
}

module.exports = ApiResponse;
