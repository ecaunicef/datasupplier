const express = require("express");
const ctrl = require("../controller/feedbackController");

const routes = express.Router();

routes.post("/get-all-list", ctrl.getAll);


module.exports = routes