import { ApiResponse } from "./apiResponse.mjs";

export class ApiError extends ApiResponse {
  constructor(code, message, other = {}) {
    super(code, other);
    this.message = message
  }
  toJSON() {
    return {
      code: this.code,
      message: this.message,
      data: this.data,
      error: true
    }
  }
}
