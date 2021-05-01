// doppler setup                // To config
// doppler run -- npm run dev   // To Start

import express from "express";
import Youch from "youch";
import cors from "cors";
import "express-async-errors";

import routes from "./routes";
import IO from "./io";

import mongoose from "mongoose";
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const whitelist = [
  "https://livetext.app",
  "https://www.livetext.app",
  "https://ace-doc.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

class App {
  constructor() {
    this.app = express();
    this.server = require("http").Server(this.app);
    this.io = require("socket.io")(this.server, {
      cors:
        process.env.NODE_ENV === "Production"
          ? corsOptions
          : {
              origin: "*",
            },
    });

    this.middlawares();
    this.routes();
    this.exceptionHandler();
  }

  middlawares() {
    this.app.use(
      cors(
        process.env.NODE_ENV === "Production"
          ? corsOptions
          : {
              origin: "*",
            }
      )
    );
    this.app.use(express.json());

    this.app.use((req, res, next) => {
      req.io = this.io;

      next();
    });

    new IO(this.io);
  }

  routes() {
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
