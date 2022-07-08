import { Router, json } from "express";
import { ResponseFactory } from "./response/responseFactory.mjs";
import apiRouting from "./router/router.mjs";
const api = Router()
api.use(json());
//! Response Injection Middleware
api.use((req, res, next) => {
  //? Inject ResponseFactory into mutable Request object.
  req.respond = ResponseFactory;
  //* Continue to Routing
  next()
})

api.use(apiRouting);

//! Error Handling
api.use((req, res, next) => {
  let resource = req.originalUrl.substring(4);
  resource = resource.endsWith("/") ? resource : resource + "/"
  return next(req.respond.Error(404, "Resource not Found", { resource }));
});

api.use((response, req, res, next) => {
  if (response instanceof ResponseFactory.ApiResponse) {
    return res.set("Content-Type", "application/json").status(response.code).json(response);
  } else if (response instanceof Error) {
    return res.set("Content-Type", "application/json").status(500).json(req.respond.Error(500, response));
  } else {
    console.log("Something went Wrong", response);
    return res.set("Content-Type", "application/json").status(500).json(req.respond.Error(500, "Something went Wrong"));
  }
})
export default api;
