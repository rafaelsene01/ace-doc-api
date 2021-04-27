// doppler setup                // To config
// doppler run -- npm run dev   // To Start

import express from "express";
import Youch from "youch";
import cors from "cors";
import "express-async-errors";

import routes from "./routes";

import mongoose from "mongoose";
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

class App {
  constructor() {
    this.app = express();
    this.server = require("http").Server(this.app);
    this.io = require("socket.io")(this.server);

    this.middlawares();
    this.routes();
    this.exceptionHandler();
  }

  middlawares() {
    this.app.use((req, res, next) => {
      req.io = this.io;

      next();
    });
    this.app.use(cors()); // cors({ origin: 'http://rafaelsene.com' })
    this.app.use(express.json());
  }

  routes() {
    io.on("connection", function (socket) {
      const { doc } = socket.handshake.query;
      io.emit("clientsCount", io.engine.clientsCount);

      socket.join(doc);

      socket.on("text", (msg) => {
        io.to(doc).emit("text", { id: socket.id, msg });
      });

      socket.on("disconnect", () => {
        socket.leave(doc);
        io.emit("clientsCount", io.engine.clientsCount);
      });
    });

    this.app.use(routes);
  }

  exceptionHandler() {
    this.app.use(async (err, req, res, next) => {
      if (process.env.NODE_ENV === "development") {
        const error = await new Youch(err, req).toJSON();

        return res.status(500).json(error);
      }

      return res.status(500).json({ error: "Internal server error" });
    });
  }
}

export default new App().server;

// https://github.com/rafaelsene01/goBarber/tree/master/backend/src
