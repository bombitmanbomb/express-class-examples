import { ApiError } from "./apiError.mjs";
import { ApiResponse } from "./apiResponse.mjs";
import { ApiSuccess } from "./apiSuccess.mjs";

export class ResponseFactory {
  static Error(code, message, data = {}) {
    return new ApiError(code, message, data)
  }
  static Success(code, data) {
    return new ApiSuccess(code, data)
  }
  static get ApiResponse() {
    return ApiResponse
  }
}
