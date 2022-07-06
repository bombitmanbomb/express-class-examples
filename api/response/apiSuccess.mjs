import { ApiResponse } from "./apiResponse.mjs";

export class ApiSuccess extends ApiResponse {
  constructor(code, data) {
    super(code, data)
  }
}
