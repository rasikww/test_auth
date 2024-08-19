require("dotenv").config();
const express = require("express");
const routes = require("./routes/routes");
const cookieParser = require("cookie-parser");

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use("/", routes);

module.exports = app;
