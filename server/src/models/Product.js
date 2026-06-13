const mongoose = require("mongoose");

const productImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      default: "",
    },
    alt: {
      type: String,
      default: "VJJ Shop jewellery product",
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Rings",
        "Earrings",
        "Pendants",
        "Bangles",
        "Bracelets",
        "Mangalsutra",
        "Necklace",
        "Nose Wear",
        "Gold Coins",
        "Bridal",
        "Ready To Ship",
      ],
    },

    material: {
      type: String,
      enum: ["Gold", "Diamond", "Silver", "Platinum", "Rose Gold", "Gemstone"],
      required: true,
    },

    purity: {
      type: String,
      enum: ["9KT", "14KT", "18KT", "22KT", "24KT", "925 Silver"],
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    compareAtPrice: {
      type: Number,
      default: 0,
    },

    makingCharges: {
      type: Number,
      default: 0,
    },

    taxRate: {
      type: Number,
      default: 3,
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
    },

    sizes: [String],

    images: [productImageSchema],

    tags: [String],

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isReadyToShip: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

productSchema.index({
  name: "text",
  description: "text",
  category: "text",
  material: "text",
  tags: "text",
});

module.exports = mongoose.model("Product", productSchema);
