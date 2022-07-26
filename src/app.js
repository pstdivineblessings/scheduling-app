const express = require("express");
const app = express();
const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss-clean");
const corsOptions = require("./config/corsOptions");
const credentials = require("./middlewares/credentials");
const routes = require("./routes/v1");

const httpStatus = require("http-status");
const config = require("./config/config");

const { errorConverter, errorHandler } = require("./middlewares/error");
const ApiError = require("./utils/ApiError");

if (config.env === "production") {
  // Handle options credentials check - before CORS!
  app.use(credentials);
}

// Cross Origin Resource Sharing
// app.use(cors(corsOptions));
// enable cors
app.use(cors());
app.options("*", cors());

// set security HTTP headers
app.use(helmet());

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json
app.use(express.json());

// sanitize request data
app.use(xss());

// v1 api routes
app.use("/v1", routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
