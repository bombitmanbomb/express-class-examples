//! Mock AUTH keys
const auth = new Map()
auth.set("abcd", { user_id: 0, permissions: new Set(["ADMIN"]) })
auth.set("1234", { user_id: 1, permissions: new Set(["MODIFY", "DELETE"]) })
auth.set("asdf", { user_id: 2, permissions: new Set(["MODIFY", "CREATE"]) })

export default function protect(access, param_match) {

  /**
   * Authorization Middleware
   * @export
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  return (req, res, next) => {
    const token = req.headers.authorization?.substring(7)?.trim()
    if (token == null || token == "")
      return next(req.respond.Error(401, "Missing Authorization Header", { "type": "bearer" }))
    let perms = auth.get(token);
    if (perms == null) return next(req.respond.Error(401, "Unauthorized"));
    if (perms.permissions.has("ADMIN")) return next();
    // Really Bad User Permission. Never do this lol
    if (param_match != null) {
      let pass = true
      for (let item in param_match) {
        let p = perms[item]
        let raw = req.params[item];
        if (p == null || raw == null) continue
        let value = null;
        //! Bad. Don't do type coersion like this in production
        switch (typeof p) {
          case "number":
            value = Number(raw)
            break;
          case "string":
            value = String(raw)
          default:
            break;
        }
        if (p != value) pass = false
      }
      console.log(pass, perms)
      if (pass == false)
        return next(req.respond.Error(401, "Attempt to modify Other User"));
    }
    if (typeof access === "string") {
      if (!perms.permissions.has(access)) return next(req.respond.Error(401, "Unauthorized", { missing: [access] }));
    } else {
      let missing = []
      for (let permission of access) {
        if (!perms.permissions.has(permission)) missing.push(permission)
      }
      if (!missing.length == 0) return next(req.respond.Error(401, "Unauthorized", { missing }));
    }
    next()
  }
}
