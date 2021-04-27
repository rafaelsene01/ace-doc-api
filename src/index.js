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
    this.io = require("socket.io")(this.server, {
      cors: {
        origin: process.env.URL_WEB ? process.env.URL_WEB : "*",
      },
    });

    this.middlawares();
    this.routes();
    this.exceptionHandler();
  }

  middlawares() {
    this.app.use(
      cors({ origin: process.env.URL_WEB ? process.env.URL_WEB : "*" })
    ); // cors({ origin: 'http://rafaelsene.com' })
    this.app.use(express.json());

    this.app.use((req, res, next) => {
      req.io = this.io;

      next();
    });
  }

  routes() {
    this.app.use(routes);

    this.io.on("connection", (socket) => {
      const { doc } = socket.handshake.query;

      socket.broadcast.emit("clientsCount", socket.server.engine.clientsCount);
      socket.emit("clientsCount", socket.server.engine.clientsCount);

      socket.join(doc);

      socket.on("text", (msg) => {
        socket.to(doc).emit("text", { id: socket.id, msg });
      });

      socket.on("disconnect", () => {
        socket.leave(doc);
        socket.broadcast.emit(
          "clientsCount",
          socket.server.engine.clientsCount
        );
      });
    });
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
