const GOLD_API_BASE_URL = "https://api.gold-api.com";
const TROY_OUNCE_IN_GRAMS = 31.1034768;

export const INDIAN_STATES_RATE_ADJUSTMENT = {
  "Uttar Pradesh": 0,
  Delhi: 80,
  Maharashtra: 120,
  "West Bengal": 90,
  Karnataka: 110,
  "Tamil Nadu": 130,
  Gujarat: 100,
  Rajasthan: 80,
  Punjab: 70,
  Haryana: 75,
  Bihar: 60,
  "Madhya Pradesh": 70,
  Odisha: 65,
  Assam: 90,
  Kerala: 140,
  Telangana: 120,
  "Andhra Pradesh": 120,
  Jharkhand: 65,
  Chhattisgarh: 65,
  Uttarakhand: 70,
};

const fallbackRates = {
  gold24kPer10g: 0,
  gold22kPer10g: 0,
  gold18kPer10g: 0,
  silverPerKg: 0,
  updatedAt: null,
  source: "Fallback",
};

const roundToNearestTen = (value) => {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value / 10) * 10;
};

const extractPrice = (data) => {
  return (
    Number(data?.price) ||
    Number(data?.price_gram_24k) * TROY_OUNCE_IN_GRAMS ||
    Number(data?.ask) ||
    Number(data?.bid) ||
    0
  );
};

const fetchMetalPrice = async (symbol) => {
  const urls = [
    `${GOLD_API_BASE_URL}/price/${symbol}/INR`,
    `${GOLD_API_BASE_URL}/price/${symbol}`,
  ];

  let lastError = null;

  for (const url of urls) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Metal API failed: ${response.status}`);
      }

      const data = await response.json();

      return {
        data,
        pricePerOz: extractPrice(data),
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
};

export const getLiveMetalRates = async (stateName = "Uttar Pradesh") => {
  try {
    const [goldResponse, silverResponse] = await Promise.all([
      fetchMetalPrice("XAU"),
      fetchMetalPrice("XAG"),
    ]);

    const goldPerOz = goldResponse.pricePerOz;
    const silverPerOz = silverResponse.pricePerOz;

    if (!goldPerOz || !silverPerOz) {
      throw new Error("Invalid metal price response");
    }

    const stateAdjustment =
      INDIAN_STATES_RATE_ADJUSTMENT[stateName] ??
      INDIAN_STATES_RATE_ADJUSTMENT["Uttar Pradesh"];

    const gold24kPerGram = goldPerOz / TROY_OUNCE_IN_GRAMS;
    const silverPerGram = silverPerOz / TROY_OUNCE_IN_GRAMS;

    const gold24kPer10g = gold24kPerGram * 10 + stateAdjustment;
    const gold22kPer10g = gold24kPer10g * (22 / 24);
    const gold18kPer10g = gold24kPer10g * (18 / 24);
    const silverPerKg = silverPerGram * 1000 + stateAdjustment * 8;

    return {
      gold24kPer10g: roundToNearestTen(gold24kPer10g),
      gold22kPer10g: roundToNearestTen(gold22kPer10g),
      gold18kPer10g: roundToNearestTen(gold18kPer10g),
      silverPerKg: roundToNearestTen(silverPerKg),
      updatedAt:
        goldResponse.data?.updatedAt ||
        goldResponse.data?.updated_at ||
        goldResponse.data?.timestamp ||
        new Date().toISOString(),
      source: "Live market API",
    };
  } catch (error) {
    console.error("Metal rates error:", error);

    return fallbackRates;
  }
};

export const getAvailableRateStates = () => {
  return Object.keys(INDIAN_STATES_RATE_ADJUSTMENT);
};
