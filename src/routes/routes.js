const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    console.log("Rasika here");
    res.send("I'm Rasika");
});

router.get("/home", (req, res) => {
    console.log("in home");
    res.send("in home page");
});

module.exports = router;
