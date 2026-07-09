const mongoose = require("mongoose");

const storeSettingsSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      default: "Verma Ji Jewellers",
      trim: true,
    },

    gstin: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },

    phone: {
      type: String,
      default: "+91 91200 69337",
      trim: true,
    },

    email: {
      type: String,
      default: "jewellersvermaji@gmail.com",
      trim: true,
    },

    address: {
      type: String,
      default:
        "Mahaveer Road, Mangal Ki Bazar, Kaptanganj, Kushinagar, Uttar Pradesh - 274301",
      trim: true,
    },

    state: {
      type: String,
      default: "Uttar Pradesh",
      trim: true,
    },

    invoicePrefix: {
      type: String,
      default: "VJJ",
      trim: true,
      uppercase: true,
    },

    defaultHsnCode: {
      type: String,
      default: "7113",
      trim: true,
    },

    defaultGstPercent: {
      type: Number,
      default: 3,
      min: 0,
    },

    terms: {
      type: String,
      default:
        "Goods once sold will not be taken back or exchanged. Subject to Kushinagar jurisdiction.",
      trim: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("StoreSettings", storeSettingsSchema);
