const roundMoney = (value) => {
  const number = Number(value || 0);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.round(number * 100) / 100;
};

const toNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};

const normaliseMakingChargeType = (value) => {
  const allowedTypes = ["per_gram", "percentage", "flat"];

  return allowedTypes.includes(value) ? value : "flat";
};

const calculateJewelleryPricing = (input = {}) => {
  const grossWeightGrams = toNumber(input.grossWeightGrams);
  const lessWeightGrams = toNumber(input.lessWeightGrams);
  const ratePerGram = toNumber(input.ratePerGram);
  const stoneValue = toNumber(input.stoneValue);
  const discountAmount = toNumber(input.discountAmount);
  const gstPercent = toNumber(input.gstPercent);

  const makingChargeType = normaliseMakingChargeType(input.makingChargeType);

  const makingChargeValue = toNumber(input.makingChargeValue);

  if (grossWeightGrams <= 0) {
    throw new Error("Gross weight must be greater than zero.");
  }

  if (lessWeightGrams < 0) {
    throw new Error("Less weight cannot be negative.");
  }

  if (lessWeightGrams > grossWeightGrams) {
    throw new Error("Less weight cannot be greater than gross weight.");
  }

  if (ratePerGram <= 0) {
    throw new Error("Rate per gram must be greater than zero.");
  }

  if (stoneValue < 0 || discountAmount < 0 || gstPercent < 0) {
    throw new Error("Stone value, discount and GST cannot be negative.");
  }

  const netWeightGrams = roundMoney(grossWeightGrams - lessWeightGrams);

  const metalValue = roundMoney(netWeightGrams * ratePerGram);

  let makingChargeAmount = 0;

  if (makingChargeType === "per_gram") {
    makingChargeAmount = roundMoney(netWeightGrams * makingChargeValue);
  }

  if (makingChargeType === "percentage") {
    makingChargeAmount = roundMoney((metalValue * makingChargeValue) / 100);
  }

  if (makingChargeType === "flat") {
    makingChargeAmount = roundMoney(makingChargeValue);
  }

  const taxableValue = roundMoney(
    Math.max(0, metalValue + stoneValue + makingChargeAmount - discountAmount),
  );

  const gstAmount = roundMoney((taxableValue * gstPercent) / 100);

  const finalPrice = roundMoney(taxableValue + gstAmount);

  return {
    grossWeightGrams: roundMoney(grossWeightGrams),
    lessWeightGrams: roundMoney(lessWeightGrams),
    netWeightGrams,
    ratePerGram: roundMoney(ratePerGram),

    metalValue,
    stoneValue: roundMoney(stoneValue),

    makingChargeType,
    makingChargeValue: roundMoney(makingChargeValue),
    makingChargeAmount,

    discountAmount: roundMoney(discountAmount),
    gstPercent: roundMoney(gstPercent),

    taxableValue,
    gstAmount,
    finalPrice,
  };
};

module.exports = {
  calculateJewelleryPricing,
  roundMoney,
  toNumber,
};
