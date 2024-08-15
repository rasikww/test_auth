const express = require("express");
const routes = require("./routes/routes");
const cookieParser = require("cookie-parser");

const app = express();

//middleware to route to "/api" in webpage
app.use("/api", routes);

module.exports = app;
