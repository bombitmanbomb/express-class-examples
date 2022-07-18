import { Router } from "express";
import { readdir, lstat } from "fs/promises"
import { join, resolve } from "node:path";
const route = Router()
export default route;

const directory = resolve("./api/router/")
console.log(directory)


//* Asyncronousely map out `router` to express routings
readdir(directory).then((items) => {
  for (let path of items) {
    if (path.startsWith(".")) continue;
    const filePath = join(directory, path);
    lstat(filePath).then(async stats => {
      if (stats.isDirectory()) {
        console.info("Loading", path)
        let module = await import("file:///" + join(filePath, "route.mjs"))
        route.use("/" + path, module.default);
      }
    })
  }
})
