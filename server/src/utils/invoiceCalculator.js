const {
  calculateJewelleryPricing,
  roundMoney,
  toNumber,
} = require("./jewelleryPricing");

const STORE_STATE = "Uttar Pradesh";

const smallNumbers = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const tensNumbers = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

const convertBelowHundred = (number) => {
  if (number < 20) return smallNumbers[number];

  const tens = Math.floor(number / 10);
  const ones = number % 10;

  return `${tensNumbers[tens]}${ones ? ` ${smallNumbers[ones]}` : ""}`;
};

const convertBelowThousand = (number) => {
  const hundred = Math.floor(number / 100);
  const remainder = number % 100;

  let words = "";

  if (hundred) {
    words += `${smallNumbers[hundred]} Hundred`;
  }

  if (remainder) {
    words += `${words ? " " : ""}${convertBelowHundred(remainder)}`;
  }

  return words;
};

const amountToWordsIndian = (amount) => {
  const roundedAmount = Math.round(toNumber(amount));

  if (roundedAmount === 0) {
    return "Rupees Zero Only";
  }

  let number = roundedAmount;

  const crore = Math.floor(number / 10000000);
  number %= 10000000;

  const lakh = Math.floor(number / 100000);
  number %= 100000;

  const thousand = Math.floor(number / 1000);
  number %= 1000;

  const parts = [];

  if (crore) parts.push(`${convertBelowThousand(crore)} Crore`);
  if (lakh) parts.push(`${convertBelowThousand(lakh)} Lakh`);
  if (thousand) parts.push(`${convertBelowThousand(thousand)} Thousand`);
  if (number) parts.push(convertBelowThousand(number));

  return `Rupees ${parts.join(" ")} Only`;
};

const getFinancialYear = (date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  if (month >= 4) {
    return `${year}-${String(year + 1).slice(-2)}`;
  }

  return `${year - 1}-${String(year).slice(-2)}`;
};

const getTaxType = (customerState, storeState = STORE_STATE) => {
  return String(customerState || "")
    .trim()
    .toLowerCase() ===
    String(storeState || "")
      .trim()
      .toLowerCase()
    ? "intra_state"
    : "inter_state";
};

const calculateInvoiceItem = (item = {}, taxType = "intra_state") => {
  const pricing = calculateJewelleryPricing({
    grossWeightGrams: item.grossWeightGrams,
    lessWeightGrams: item.lessWeightGrams,
    ratePerGram: item.ratePerGram,
    stoneValue: item.stoneValue,
    makingChargeType: item.makingChargeType,
    makingChargeValue: item.makingChargeValue,
    discountAmount: item.discountAmount,
    gstPercent: item.gstPercent ?? 3,
  });

  const gstPercent = pricing.gstPercent;
  const gstAmount = pricing.gstAmount;

  const isIntraState = taxType === "intra_state";

  const cgstPercent = isIntraState ? roundMoney(gstPercent / 2) : 0;
  const sgstPercent = isIntraState ? roundMoney(gstPercent / 2) : 0;
  const igstPercent = isIntraState ? 0 : gstPercent;

  const cgstAmount = isIntraState ? roundMoney(gstAmount / 2) : 0;
  const sgstAmount = isIntraState ? roundMoney(gstAmount / 2) : 0;
  const igstAmount = isIntraState ? 0 : gstAmount;

  return {
    product: item.product || null,
    productName: String(item.productName || "").trim(),
    sku: String(item.sku || "").trim(),
    hsnCode: String(item.hsnCode || "7113").trim(),
    material: String(item.material || "").trim(),
    purity: String(item.purity || "").trim(),
    quantity: Math.max(1, toNumber(item.quantity || 1)),

    grossWeightGrams: pricing.grossWeightGrams,
    lessWeightGrams: pricing.lessWeightGrams,
    netWeightGrams: pricing.netWeightGrams,
    ratePerGram: pricing.ratePerGram,
    metalValue: pricing.metalValue,
    stoneValue: pricing.stoneValue,

    makingChargeType: pricing.makingChargeType,
    makingChargeValue: pricing.makingChargeValue,
    makingChargeAmount: pricing.makingChargeAmount,

    discountAmount: pricing.discountAmount,
    taxableValue: pricing.taxableValue,

    gstPercent,
    gstAmount,

    cgstPercent,
    cgstAmount,
    sgstPercent,
    sgstAmount,
    igstPercent,
    igstAmount,

    lineTotal: pricing.finalPrice,
  };
};

const calculateInvoice = ({
  customerState,
  storeState = STORE_STATE,
  items = [],
}) => {
  const taxType = getTaxType(customerState, storeState);

  const calculatedItems = items.map((item) =>
    calculateInvoiceItem(item, taxType),
  );

  const totals = calculatedItems.reduce(
    (acc, item) => {
      acc.grossWeightGrams += item.grossWeightGrams;
      acc.netWeightGrams += item.netWeightGrams;
      acc.metalValue += item.metalValue;
      acc.stoneValue += item.stoneValue;
      acc.makingChargeAmount += item.makingChargeAmount;
      acc.discountAmount += item.discountAmount;
      acc.taxableValue += item.taxableValue;
      acc.cgstAmount += item.cgstAmount;
      acc.sgstAmount += item.sgstAmount;
      acc.igstAmount += item.igstAmount;
      acc.gstAmount += item.gstAmount;
      acc.grandTotalBeforeRoundOff += item.lineTotal;

      return acc;
    },
    {
      grossWeightGrams: 0,
      netWeightGrams: 0,
      metalValue: 0,
      stoneValue: 0,
      makingChargeAmount: 0,
      discountAmount: 0,
      taxableValue: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      gstAmount: 0,
      grandTotalBeforeRoundOff: 0,
    },
  );

  Object.keys(totals).forEach((key) => {
    totals[key] = roundMoney(totals[key]);
  });

  const roundedGrandTotal = Math.round(totals.grandTotalBeforeRoundOff);

  totals.roundOff = roundMoney(
    roundedGrandTotal - totals.grandTotalBeforeRoundOff,
  );

  totals.grandTotal = roundedGrandTotal;

  return {
    taxType,
    items: calculatedItems,
    totals,
    amountInWords: amountToWordsIndian(roundedGrandTotal),
  };
};

module.exports = {
  STORE_STATE,
  amountToWordsIndian,
  getFinancialYear,
  getTaxType,
  calculateInvoiceItem,
  calculateInvoice,
};
