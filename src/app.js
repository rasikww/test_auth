require("dotenv").config();
const express = require("express");
const routes = require("./routes/routes");
const cookieParser = require("cookie-parser");
const { GenerateAndStoreKeys } = require("./config/keyManagement");

const app = express();

GenerateAndStoreKeys();
app.use(cookieParser());
app.use(express.json());
app.use("/", routes);

module.exports = app;
