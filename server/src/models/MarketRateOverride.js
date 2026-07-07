const mongoose = require("mongoose");

const marketRateOverrideSchema = new mongoose.Schema(
  {
    state: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    isManualActive: {
      type: Boolean,
      default: false,
    },

    // Stored as YYYY-MM-DD, based on India time.
    effectiveDate: {
      type: String,
      required: true,
    },

    rates: {
      gold24kPer10g: {
        type: Number,
        default: null,
      },
      gold22kPer10g: {
        type: Number,
        default: null,
      },
      gold18kPer10g: {
        type: Number,
        default: null,
      },
      silverPerKg: {
        type: Number,
        default: null,
      },
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
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

module.exports = mongoose.model("MarketRateOverride", marketRateOverrideSchema);
