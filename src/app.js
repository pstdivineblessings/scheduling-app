const express = require("express");
const app = express();
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
// const { logger } = require("./middlewares/logEvents");
// const errorHandler = require("./middlewares/errorHandler");
// const verifyJWT = require("./middlewares/verifyJWT");
const cookieParser = require("cookie-parser");
const credentials = require("./middlewares/credentials");
const routes = require("./routes/v1");
// const db = require("./models");

const httpStatus = require('http-status');
const config = require('./config/config');
// const morgan = require('./config/morgan');
// const { jwtStrategy } = require('./config/passport');
// const { authLimiter } = require('./middlewares/rateLimiter');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');


// // custom middleware logger
// app.use(logger);

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

// Cross Origin Resource Sharing
// app.use(cors(corsOptions));
// enable cors
app.use(cors());
app.options('*', cors());

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json
app.use(express.json());

//middleware for cookies
app.use(cookieParser());

// db.sequelize.sync({ alter: true }).then(() => {
//     console.log("Alter and re-sync db.");
//   });

// v1 api routes
app.use("/v1", routes);

// app.all("*", (req, res) => {
//   res.status(404);
//   if (req.accepts("html")) {
//     res.sendFile(path.join(__dirname, "views", "404.html"));
//   } else if (req.accepts("json")) {
//     res.json({ error: "404 Not Found" });
//   } else {
//     res.type("txt").send("404 Not Found");
//   }
// });

// app.use(errorHandler);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;