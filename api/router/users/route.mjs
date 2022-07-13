import { Router } from "express";
import Database from "../../../database/database.mjs";
import protect from "../../middleware/protect.mjs";
import cache from "../../middleware/cache.mjs";
import { PagenatedArray } from "../../util/PagenatedArray.mjs";
import { User } from "../../../database/model/user.mjs"
import { validate } from "../../middleware/validate.mjs";
import z from "zod";
const router = Router()

export default router

const newUserValidation = z.object({
  body: z.object({
    username: z.string().describe("Username").min(3, "Username is too short").max(16, "Username is too long")
  })
})
const getUserValidation = z.object({
  params: z.object({
    user_id: z.string().regex(/^[0-9]+$/, "user_id must be a Positive Integer").transform(v => parseInt(v)).refine(n => n >= 0)
  })
})
const getPagenatedUsersValidation = z.object({
  query: z.object({
    page: z.string().regex(/^[0-9]+$/,"Expected Integer >=0").transform(v => parseInt(v)).refine(n => n > 0, "Expected Integer >=0").optional(),
    size: z.string().regex(/^[0-9]+$/,"Expected Integer >=1, <=100").transform(v => parseInt(v)).refine(n => n >= 1 && n <= 100, "Expected Integer >=1, <=100").optional()
  })
})



//? Register new user
router.route("/")
  .options((req, res) => {
    res.setHeader("Allow", "OPTIONS, POST, GET").send()
  })
  .get(
    cache(60),
    validate(getPagenatedUsersValidation),
    (req, res, next) => {

      /**
       * @type {PagenatedArray<User>}
       */
      let user =
        new PagenatedArray(
          {
            items: Database.chain.get("users").value(),
            page: Math.max(req.query.page ?? 1, 1),
            size: req.query.size ?? 25
          })
      return next(
        req.respond.Success(
          200,
          user
        )
      );
    })
  .post(
    validate(newUserValidation),
    (req, res, next) => {
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
  .all(
    validate(getUserValidation)
  )
  .get(
    async (req, res, next) => { //* GET
      const id = req.params.user_id;
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
      const id = req.params.user_id;
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
      const id = req.params.user_id;
      let o = Database.chain.get("users").find({ id }).value()
      if (o == null) return next(req.respond.Error(404, "User not Found", { id }));
      let removed = Database.chain.get("users").remove({ id }).value();
      Database.write()
      return next(req.respond.Success(200, removed));
    })
