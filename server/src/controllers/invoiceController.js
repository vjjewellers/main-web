const Invoice = require("../models/Invoice");
const Product = require("../models/Product");
const { getOrCreateStoreSettings } = require("./storeSettingsController");

const {
  STORE_STATE,
  getFinancialYear,
  calculateInvoice,
} = require("../utils/invoiceCalculator");

const cleanText = (value) => String(value || "").trim();

const getNextInvoiceNumber = async (
  date = new Date(),
  invoicePrefix = "VJJ",
) => {
  const financialYear = getFinancialYear(date);

  const count = await Invoice.countDocuments({
    financialYear,
  });

  const serial = String(count + 1).padStart(4, "0");

  return `${invoicePrefix}/${financialYear}/${serial}`;
};

const normaliseInvoiceItemFromProduct = async (rawItem = {}) => {
  let product = null;

  if (rawItem.product) {
    product = await Product.findById(rawItem.product);
  }

  const productPricing = product?.jewelleryPricing || {};

  return {
    product: product?._id || rawItem.product || null,
    productName: cleanText(rawItem.productName || product?.name),
    sku: cleanText(rawItem.sku || product?.sku),
    hsnCode: cleanText(rawItem.hsnCode || "7113"),
    material: cleanText(rawItem.material || product?.material),
    purity: cleanText(rawItem.purity || product?.purity),
    quantity: Number(rawItem.quantity || 1),

    grossWeightGrams: Number(
      rawItem.grossWeightGrams ?? productPricing.grossWeightGrams ?? 0,
    ),

    lessWeightGrams: Number(
      rawItem.lessWeightGrams ?? productPricing.lessWeightGrams ?? 0,
    ),

    ratePerGram: Number(rawItem.ratePerGram ?? productPricing.ratePerGram ?? 0),

    stoneValue: Number(rawItem.stoneValue ?? productPricing.stoneValue ?? 0),

    makingChargeType:
      rawItem.makingChargeType || productPricing.makingChargeType || "flat",

    makingChargeValue: Number(
      rawItem.makingChargeValue ??
        productPricing.makingChargeValue ??
        product?.makingCharge ??
        0,
    ),

    discountAmount: Number(
      rawItem.discountAmount ?? productPricing.discountAmount ?? 0,
    ),

    gstPercent: Number(rawItem.gstPercent ?? productPricing.gstPercent ?? 3),
  };
};

const getInvoicesAdmin = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");

      query.$or = [
        { invoiceNumber: searchRegex },
        { "customer.name": searchRegex },
        { "customer.phone": searchRegex },
        { "customer.gstin": searchRegex },
      ];
    }

    const currentPage = Math.max(1, Number(page || 1));
    const pageLimit = Math.max(1, Number(limit || 20));
    const skip = (currentPage - 1) * pageLimit;

    const [invoices, totalInvoices] = await Promise.all([
      Invoice.find(query)
        .sort({ invoiceDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(pageLimit),
      Invoice.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      count: invoices.length,
      totalInvoices,
      currentPage,
      totalPages: Math.ceil(totalInvoices / pageLimit),
      invoices,
    });
  } catch (error) {
    next(error);
  }
};

const getInvoiceByIdAdmin = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate(
      "items.product",
      "name slug images",
    );

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found.",
      });
    }

    return res.status(200).json({
      success: true,
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

const previewInvoiceAdmin = async (req, res, next) => {
  try {
    const customerState = cleanText(req.body?.customer?.state) || STORE_STATE;

    const rawItems = Array.isArray(req.body.items) ? req.body.items : [];

    if (!rawItems.length) {
      return res.status(400).json({
        success: false,
        message: "At least one item is required.",
      });
    }

    const normalisedItems = await Promise.all(
      rawItems.map(normaliseInvoiceItemFromProduct),
    );

    const calculation = calculateInvoice({
      customerState,
      storeState: STORE_STATE,
      items: normalisedItems,
    });

    return res.status(200).json({
      success: true,
      preview: calculation,
    });
  } catch (error) {
    next(error);
  }
};

const createInvoiceAdmin = async (req, res, next) => {
  try {
    const invoiceDate = req.body.invoiceDate
      ? new Date(req.body.invoiceDate)
      : new Date();

    const settings = await getOrCreateStoreSettings();

    const customer = {
      name: cleanText(req.body.customer?.name),
      phone: cleanText(req.body.customer?.phone),
      email: cleanText(req.body.customer?.email),
      address: cleanText(req.body.customer?.address),
      city: cleanText(req.body.customer?.city),
      state: cleanText(req.body.customer?.state) || STORE_STATE,
      pincode: cleanText(req.body.customer?.pincode),
      gstin: cleanText(req.body.customer?.gstin).toUpperCase(),
    };

    if (!customer.name) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required.",
      });
    }

    const rawItems = Array.isArray(req.body.items) ? req.body.items : [];

    if (!rawItems.length) {
      return res.status(400).json({
        success: false,
        message: "At least one invoice item is required.",
      });
    }

    const normalisedItems = await Promise.all(
      rawItems.map(normaliseInvoiceItemFromProduct),
    );

    const invalidItem = normalisedItems.find(
      (item) => !item.productName || item.grossWeightGrams <= 0,
    );

    if (invalidItem) {
      return res.status(400).json({
        success: false,
        message: "Each invoice item must have product name and gross weight.",
      });
    }

    const calculation = calculateInvoice({
      customerState: customer.state,
      storeState: STORE_STATE,
      items: normalisedItems,
    });

    const financialYear = getFinancialYear(invoiceDate);
    const invoiceNumber =
      cleanText(req.body.invoiceNumber) ||
      (await getNextInvoiceNumber(
        invoiceDate,
        settings.invoicePrefix || "VJJ",
      ));

    const existingInvoice = await Invoice.findOne({
      invoiceNumber,
    });

    if (existingInvoice) {
      return res.status(400).json({
        success: false,
        message: "Invoice number already exists.",
      });
    }
    const stockItems = [];

    for (const item of normalisedItems) {
      if (!item.product) continue;

      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found for item ${item.productName}.`,
        });
      }

      const saleQuantity = Math.max(1, Number(item.quantity || 1));
      const currentStock = Number(product.stock || 0);

      if (currentStock < saleQuantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available stock: ${currentStock}.`,
        });
      }

      stockItems.push({
        product,
        saleQuantity,
      });
    }

    const invoice = await Invoice.create({
      invoiceNumber,
      invoiceDate,
      financialYear,

      customer,

      store: {
        name: settings.storeName || "Verma Ji Jewellers",
        gstin: settings.gstin || "",
        phone: settings.phone || "+91 91200 69337",
        email: settings.email || "jewellersvermaji@gmail.com",
        address:
          settings.address ||
          "Mahaveer Road, Mangal Ki Bazar, Kaptanganj, Kushinagar, Uttar Pradesh - 274301",
        state: settings.state || STORE_STATE,
      },

      placeOfSupply: customer.state,
      taxType: calculation.taxType,

      paymentMode: req.body.paymentMode || "cash",
      paymentReference: cleanText(req.body.paymentReference),
      salesperson: cleanText(req.body.salesperson),

      items: calculation.items,
      totals: calculation.totals,
      amountInWords: calculation.amountInWords,

      notes: cleanText(req.body.notes),
      terms: cleanText(req.body.terms) || settings.terms,

      status: req.body.status === "draft" ? "draft" : "issued",
      createdBy: req.user?._id || null,
    });

    if (invoice.status === "issued") {
      await Promise.all(
        stockItems.map(async ({ product, saleQuantity }) => {
          product.stock = Math.max(
            0,
            Number(product.stock || 0) - saleQuantity,
          );
          await product.save();
        }),
      );
    }

    return res.status(201).json({
      success: true,
      message: "Invoice created successfully.",
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

const cancelInvoiceAdmin = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found.",
      });
    }

    invoice.status = "cancelled";
    invoice.notes = cleanText(
      req.body.reason
        ? `${invoice.notes || ""}\nCancellation reason: ${req.body.reason}`
        : invoice.notes,
    );

    await invoice.save();

    return res.status(200).json({
      success: true,
      message: "Invoice cancelled successfully.",
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInvoicesAdmin,
  getInvoiceByIdAdmin,
  previewInvoiceAdmin,
  createInvoiceAdmin,
  cancelInvoiceAdmin,
};
