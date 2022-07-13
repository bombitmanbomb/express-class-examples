/**
 * @export
 * @param {import("zod").AnyZodObject} validation
 */
export function validate(validation) {
  /**
     * Authorization Middleware
     * @export
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     * @param {import("express").NextFunction} next
     */
  return async (req, res, next) => {
    try {
      const zodObject = await validation.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      })
      if (zodObject.body != null) req.body = zodObject.body
      if (zodObject.query != null) req.query = zodObject.query
      if (zodObject.params != null) req.params = zodObject.params
      return next()
    } catch (error) {
      return next(req.respond.Error(400, "Validation_Error", error.issues))
    }
  }
}
