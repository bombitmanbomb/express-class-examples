export class ApiResponse {
  constructor(code, data = {}) {
    this.code = code
    this.data = data
  }
  toJSON() {
    return {
      code: this.code,
      data: this.data
    }
  }
}
