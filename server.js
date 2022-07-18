const port = 3001;
import Express from "express";
import api from "./api/api.mjs";
const app = Express()
app.use(Express.static("./dist")) // Enable Frontend Static Site

app.use("/api",api)
app.listen(port,()=>{console.log(`Listening on port ${port}.`)});
