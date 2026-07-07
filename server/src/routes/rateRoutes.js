const express = require("express");

const {
  getDisplayedMetalRates,
  getRateStates,
} = require("../controllers/rateController");

const router = express.Router();

router.get("/metals", getDisplayedMetalRates);
router.get("/states", getRateStates);

module.exports = router;
