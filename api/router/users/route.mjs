import { Router } from "express";
import { Database } from "../../../database/database.mjs";
import { protect } from "../../auth/protect.mjs";
import { cache } from "../../cache/cache.mjs";

const router = Router()

export default router

//? Register new user
router.route("/")
  .options((req, res) => {
    res.setHeader("Allow", "OPTIONS, POST, GET").send()
  })
  .get(
    cache(60),
    (req, res, next) => {
      let totalItems = Database.chain.get("users").value().length
      let page = Math.max(Number.parseInt(req.query.page ?? 1), 1),
        pageSize = Number.parseInt(req.query.size ?? 25),
        offset = (page - 1) * pageSize,
        pagedItems = Database.chain.get("users").drop(offset).slice(0, pageSize).value();
      Database.read(); //! Throwaway changes
      let response = {
        page,
        size: pageSize,
        total: pagedItems.length,
        total_pages: Math.ceil(totalItems / pageSize),
        users: pagedItems
      }
      return next(req.respond.Success(200, response));
    })
  .post((req, res, next) => {
    console.log("New User")
    let newUser = { username: req.body.username };
    if (newUser.username == null) return next(req.respond.Error(400, "Invalid Schema", { missing: ["username"] }))
    if (Database.chain.get("users").find({ username: newUser.username }).value() != null)
      return next(req.respond.Error(403, "username in Use", { username: newUser.username }));
    let newIndex = 0
    Database.chain.get("users").value().forEach(element => {
      if (element.id > newIndex) newIndex = element.id + 1
    });
    newUser.id = newIndex
    Database.chain.get("users").push(newUser).value();
    Database.write();
    return next(req.respond.Success(201, newUser));
  })
router.route("/:user_id")
  .options((req, res) => {
    res.setHeader("Allow", "OPTIONS, GET, HEAD, POST, PUT, DELETE").send()
  })
  .all((req, res, next) => {
    if (!req.params.user_id.match(/^[0-9]*$/)) {
      return next(req.respond.Error(
        400,
        "Invalid Parameter: id",
        {
          value: req.params.user_id,
          validation: "^[0-9]*$"
        }
      ))
    }
    next()
  })
  .get(
    async (req, res, next) => { //* GET
      const id = Number.parseInt(req.params.user_id);
      let user = await Database.chain.get("users").find({ id }).value()
      if (user) {
        return next(req.respond.Success(200, user))
      } else {
        return next(req.respond.Error(404, "User not Found", { id }))
      }
    })
  .put(
    protect("MODIFY", { "user_id": "user_id" }),
    async (req, res, next) => { //* PUT
      const id = Number.parseInt(req.params.user_id);
      let o = Database.chain.get("users").find({ id }).value()
      let n = req.body;

      if (o == null) { return next(req.respond.Error(404, "User not Found", { id })); }
      let newUser = { ...o, ...n, id: o.id };
      if (n.username != null) {
        if (Database.chain.get("users").find({ username: n.username }).value() != null)
          return next(req.respond.Error(403, "username in Use", { username: n.username }));
      }
      Database.chain.get("users").find({ id }).assign(newUser).value();
      Database.write();

      return next(req.respond.Success(200, newUser));
    })
  .delete( //* DELETE
    protect("DELETE", { "user_id": "user_id" }),
    async (req, res, next) => {
      const id = Number.parseInt(req.params.user_id);
      let o = Database.chain.get("users").find({ id }).value()
      if (o == null) return next(req.respond.Error(404, "User not Found", { id }));
      let removed = Database.chain.get("users").remove({ id }).value();
      Database.write()
      return next(req.respond.Success(200, removed));
    })
