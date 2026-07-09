const mongoose = require("mongoose");

const invoiceItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },

    productName: {
      type: String,
      required: true,
      trim: true,
    },

    sku: {
      type: String,
      default: "",
      trim: true,
    },

    hsnCode: {
      type: String,
      default: "7113",
      trim: true,
    },

    material: {
      type: String,
      default: "",
      trim: true,
    },

    purity: {
      type: String,
      default: "",
      trim: true,
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    grossWeightGrams: {
      type: Number,
      default: 0,
      min: 0,
    },

    lessWeightGrams: {
      type: Number,
      default: 0,
      min: 0,
    },

    netWeightGrams: {
      type: Number,
      default: 0,
      min: 0,
    },

    ratePerGram: {
      type: Number,
      default: 0,
      min: 0,
    },

    metalValue: {
      type: Number,
      default: 0,
      min: 0,
    },

    stoneValue: {
      type: Number,
      default: 0,
      min: 0,
    },

    makingChargeType: {
      type: String,
      enum: ["per_gram", "percentage", "flat"],
      default: "flat",
    },

    makingChargeValue: {
      type: Number,
      default: 0,
      min: 0,
    },

    makingChargeAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    taxableValue: {
      type: Number,
      default: 0,
      min: 0,
    },

    gstPercent: {
      type: Number,
      default: 3,
      min: 0,
    },

    gstAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    cgstPercent: {
      type: Number,
      default: 1.5,
      min: 0,
    },

    cgstAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    sgstPercent: {
      type: Number,
      default: 1.5,
      min: 0,
    },

    sgstAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    igstPercent: {
      type: Number,
      default: 0,
      min: 0,
    },

    igstAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    lineTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    invoiceDate: {
      type: Date,
      default: Date.now,
      index: true,
    },

    financialYear: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    customer: {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      phone: {
        type: String,
        default: "",
        trim: true,
      },

      email: {
        type: String,
        default: "",
        trim: true,
      },

      address: {
        type: String,
        default: "",
        trim: true,
      },

      city: {
        type: String,
        default: "",
        trim: true,
      },

      state: {
        type: String,
        default: "Uttar Pradesh",
        trim: true,
      },

      pincode: {
        type: String,
        default: "",
        trim: true,
      },

      gstin: {
        type: String,
        default: "",
        trim: true,
        uppercase: true,
      },
    },

    store: {
      name: {
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
    },

    placeOfSupply: {
      type: String,
      default: "Uttar Pradesh",
      trim: true,
    },

    taxType: {
      type: String,
      enum: ["intra_state", "inter_state"],
      default: "intra_state",
      index: true,
    },

    paymentMode: {
      type: String,
      enum: ["cash", "upi", "card", "bank_transfer", "mixed", "other"],
      default: "cash",
    },

    paymentReference: {
      type: String,
      default: "",
      trim: true,
    },

    salesperson: {
      type: String,
      default: "",
      trim: true,
    },

    items: {
      type: [invoiceItemSchema],
      required: true,
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "At least one invoice item is required.",
      },
    },

    totals: {
      grossWeightGrams: {
        type: Number,
        default: 0,
      },

      netWeightGrams: {
        type: Number,
        default: 0,
      },

      metalValue: {
        type: Number,
        default: 0,
      },

      stoneValue: {
        type: Number,
        default: 0,
      },

      makingChargeAmount: {
        type: Number,
        default: 0,
      },

      discountAmount: {
        type: Number,
        default: 0,
      },

      taxableValue: {
        type: Number,
        default: 0,
      },

      cgstAmount: {
        type: Number,
        default: 0,
      },

      sgstAmount: {
        type: Number,
        default: 0,
      },

      igstAmount: {
        type: Number,
        default: 0,
      },

      gstAmount: {
        type: Number,
        default: 0,
      },

      roundOff: {
        type: Number,
        default: 0,
      },

      grandTotalBeforeRoundOff: {
        type: Number,
        default: 0,
      },

      grandTotal: {
        type: Number,
        default: 0,
      },
    },

    amountInWords: {
      type: String,
      default: "",
      trim: true,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    terms: {
      type: String,
      default:
        "Goods once sold will not be taken back or exchanged. Subject to Kushinagar jurisdiction.",
      trim: true,
    },

    status: {
      type: String,
      enum: ["draft", "issued", "cancelled"],
      default: "issued",
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

invoiceSchema.index({ invoiceDate: -1 });
invoiceSchema.index({ "customer.phone": 1 });
invoiceSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Invoice", invoiceSchema);
