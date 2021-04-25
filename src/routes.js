import { Router } from "express";

const TextController = require("./controllers/TextController");

const routes = new Router();

routes.get("/", (req, res) => {
  return res.json("Ace_Doc On");
});
routes.get("/:_id", TextController.getText);
routes.patch("/:_id", TextController.updateText);
// routes.post("/", HomeController.postText);
// routes.post("/:_id", HomeController.postText);

module.exports = routes;
