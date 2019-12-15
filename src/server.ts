import https from "https";
import express from "express";
import * as fs from 'fs';
import * as util from 'util'
import { applyMiddleware, applyRoutes } from "./utils";
import middleware from "./middleware";
import errorHandlers from "./middleware/errorHandlers";
import routes from "./services";

/* Error handling Block */
process.on("uncaughtException", e => {
    console.log(e);
    process.exit(1);
});
process.on("unhandledRejection", e => {
    console.log(e);
    process.exit(1);
});
/*****/

const readFile = util.promisify(fs.readFile);
 
const startServer = async () => {
  const { PORT = 3000 } = process.env;
  const [key, cert] = await Promise.all([
    readFile('../key.pem'),
    readFile('../certificate.pem')
  ]);

  const router = express();
  applyMiddleware(middleware, router);
  applyRoutes(routes, router);
  applyMiddleware(errorHandlers, router);

  const server = https.createServer({ key, cert }, router);
  server.listen(PORT, () =>
    console.log(`Server is running https://localhost:${PORT}...`)
  );
}

startServer();

/* Before HTTPS
const router = express();

const { PORT = 3000 } = process.env;
const server = https.createServer(router);

server.listen(PORT, () =>
  console.log(`Server is running http://localhost:${PORT}...`)
); */