const MarketRateOverride = require("../models/MarketRateOverride");

const TROY_OUNCE_IN_GRAMS = 31.1034768;
const CACHE_DURATION_MS = 15 * 60 * 1000;

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

let cachedLiveRates = null;
let cachedAt = 0;

const getIndiaDate = () => {
  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts
      .filter((part) => ["year", "month", "day"].includes(part.type))
      .map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const roundToNearestTen = (value) => {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.round(value / 10) * 10;
};

const allManualRatesAreValid = (rates = {}) => {
  return [
    rates.gold24kPer10g,
    rates.gold22kPer10g,
    rates.gold18kPer10g,
    rates.silverPerKg,
  ].every((value) => Number(value) > 0);
};

const fetchGoldApiMetal = async (metalSymbol) => {
  const apiKey = process.env.GOLDAPI_KEY;

  if (!apiKey) {
    throw new Error("GOLDAPI_KEY is missing in Render environment variables");
  }

  const response = await fetch(
    `https://www.goldapi.io/api/${metalSymbol}/INR`,
    {
      headers: {
        "x-access-token": apiKey,
        "Content-Type": "application/json",
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error || `Unable to fetch ${metalSymbol} market data`,
    );
  }

  return data;
};

const getFirstPositiveNumber = (...values) => {
  for (const value of values) {
    const parsed = Number(value);

    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return 0;
};

const getLiveMarketRates = async () => {
  const now = Date.now();

  if (cachedLiveRates && now - cachedAt < CACHE_DURATION_MS) {
    return {
      ...cachedLiveRates,
      cached: true,
    };
  }

  const [goldData, silverData] = await Promise.all([
    fetchGoldApiMetal("XAU"),
    fetchGoldApiMetal("XAG"),
  ]);

  const gold24kPerGram = getFirstPositiveNumber(
    goldData.price_gram_24k,
    goldData.price_gram_999,
    goldData.price_gram,
    toNumber(goldData.price) / TROY_OUNCE_IN_GRAMS,
  );

  const gold22kPerGram = getFirstPositiveNumber(
    goldData.price_gram_22k,
    gold24kPerGram * (22 / 24),
  );

  const gold18kPerGram = getFirstPositiveNumber(
    goldData.price_gram_18k,
    gold24kPerGram * (18 / 24),
  );

  const silverPerGram = getFirstPositiveNumber(
    silverData.price_gram_999,
    silverData.price_gram,
    toNumber(silverData.price) / TROY_OUNCE_IN_GRAMS,
  );

  if (!gold24kPerGram || !gold22kPerGram || !gold18kPerGram || !silverPerGram) {
    throw new Error("Live market API returned incomplete rate data");
  }

  cachedLiveRates = {
    rates: {
      gold24kPer10g: roundToNearestTen(gold24kPerGram * 10),
      gold22kPer10g: roundToNearestTen(gold22kPerGram * 10),
      gold18kPer10g: roundToNearestTen(gold18kPerGram * 10),
      silverPerKg: roundToNearestTen(silverPerGram * 1000),
    },
    updatedAt: new Date().toISOString(),
    source: "Live market API",
    cached: false,
  };

  cachedAt = now;

  return cachedLiveRates;
};

/*
  PUBLIC ENDPOINT:
  First checks whether the admin has entered active manual values for today.
  If not, returns live API values.
*/
exports.getDisplayedMetalRates = async (req, res) => {
  try {
    const state = String(req.query.state || "Uttar Pradesh").trim();
    const todayIndia = getIndiaDate();

    const override = await MarketRateOverride.findOne({ state }).lean();

    const shouldShowManualRate =
      override &&
      override.isManualActive &&
      override.effectiveDate === todayIndia &&
      allManualRatesAreValid(override.rates);

    if (shouldShowManualRate) {
      return res.json({
        success: true,
        state,
        displayMode: "manual",
        rates: {
          gold24kPer10g: roundToNearestTen(
            Number(override.rates.gold24kPer10g),
          ),
          gold22kPer10g: roundToNearestTen(
            Number(override.rates.gold22kPer10g),
          ),
          gold18kPer10g: roundToNearestTen(
            Number(override.rates.gold18kPer10g),
          ),
          silverPerKg: roundToNearestTen(Number(override.rates.silverPerKg)),
        },
        updatedAt: override.updatedAt,
        effectiveDate: override.effectiveDate,
        source: "Store rate",
        note: override.notes || "",
        disclaimer:
          "Final billing price may vary based on jewellery weight, purity, making charges, wastage, GST and store policy.",
      });
    }

    const liveRates = await getLiveMarketRates();

    return res.json({
      success: true,
      state,
      displayMode: "api",
      rates: liveRates.rates,
      updatedAt: liveRates.updatedAt,
      source: "Live market reference",
      cached: liveRates.cached,
      disclaimer:
        "Indicative live market reference. Final billing price may vary based on jewellery weight, purity, making charges, wastage, GST and store policy.",
    });
  } catch (error) {
    console.error("Public rate fetch error:", error.message);

    return res.status(502).json({
      success: false,
      message: "Unable to fetch market rates right now",
    });
  }
};

exports.getRateStates = (req, res) => {
  return res.json({
    success: true,
    defaultState: "Uttar Pradesh",
    states: INDIAN_STATES,
  });
};

/*
  ADMIN ENDPOINT:
  Returns current saved manual setting for selected state.
*/
exports.getAdminRateSettings = async (req, res) => {
  try {
    const state = String(req.query.state || "Uttar Pradesh").trim();
    const todayIndia = getIndiaDate();

    const setting = await MarketRateOverride.findOne({ state })
      .populate("updatedBy", "name email")
      .lean();

    const manualIsActiveToday =
      setting &&
      setting.isManualActive &&
      setting.effectiveDate === todayIndia &&
      allManualRatesAreValid(setting.rates);

    return res.json({
      success: true,
      state,
      todayIndia,
      manualIsActiveToday,
      setting: setting || null,
    });
  } catch (error) {
    console.error("Admin rate setting fetch error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load rate settings",
    });
  }
};

/*
  ADMIN ENDPOINT:
  Gives API reference without applying manual override.
*/
exports.getAdminLiveRateReference = async (req, res) => {
  try {
    const liveRates = await getLiveMarketRates();

    return res.json({
      success: true,
      source: "Live market API reference",
      updatedAt: liveRates.updatedAt,
      cached: liveRates.cached,
      rates: liveRates.rates,
    });
  } catch (error) {
    console.error("Live API reference error:", error.message);

    return res.status(502).json({
      success: false,
      message: "Unable to fetch live API reference",
    });
  }
};

/*
  ADMIN ENDPOINT:
  Create or update selected state's manual rate.
*/
exports.saveAdminRateSettings = async (req, res) => {
  try {
    const state = String(req.params.state || "").trim();

    if (!INDIAN_STATES.includes(state)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid Indian state",
      });
    }

    const {
      isManualActive,
      effectiveDate,
      gold24kPer10g,
      gold22kPer10g,
      gold18kPer10g,
      silverPerKg,
      notes,
    } = req.body;

    const rates = {
      gold24kPer10g: toNumber(gold24kPer10g),
      gold22kPer10g: toNumber(gold22kPer10g),
      gold18kPer10g: toNumber(gold18kPer10g),
      silverPerKg: toNumber(silverPerKg),
    };

    if (isManualActive && !allManualRatesAreValid(rates)) {
      return res.status(400).json({
        success: false,
        message:
          "Enter valid 24K, 22K, 18K gold and silver rates before enabling manual mode",
      });
    }

    const setting = await MarketRateOverride.findOneAndUpdate(
      { state },
      {
        state,
        isManualActive: Boolean(isManualActive),
        effectiveDate: effectiveDate || getIndiaDate(),
        rates,
        notes: String(notes || "").trim(),
        updatedBy: req.user?._id || null,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    );

    return res.json({
      success: true,
      message: isManualActive
        ? "Manual market rates are now active"
        : "Manual market rates are disabled. API fallback will be used.",
      setting,
    });
  } catch (error) {
    console.error("Save manual rate error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to save market rate settings",
    });
  }
};

exports.disableAdminManualRate = async (req, res) => {
  try {
    const state = String(req.params.state || "").trim();

    const setting = await MarketRateOverride.findOneAndUpdate(
      { state },
      {
        isManualActive: false,
        updatedBy: req.user?._id || null,
      },
      {
        new: true,
      },
    );

    return res.json({
      success: true,
      message: "Manual rates disabled. Live API fallback is active.",
      setting,
    });
  } catch (error) {
    console.error("Disable manual rate error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to disable manual rates",
    });
  }
};
