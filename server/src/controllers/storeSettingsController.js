const StoreSettings = require("../models/StoreSettings");

const cleanText = (value) => String(value || "").trim();

const getOrCreateStoreSettings = async () => {
  let settings = await StoreSettings.findOne();

  if (!settings) {
    settings = await StoreSettings.create({});
  }

  return settings;
};

const getStoreSettingsAdmin = async (req, res, next) => {
  try {
    const settings = await getOrCreateStoreSettings();

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    next(error);
  }
};

const updateStoreSettingsAdmin = async (req, res, next) => {
  try {
    const settings = await getOrCreateStoreSettings();

    settings.storeName = cleanText(req.body.storeName) || settings.storeName;
    settings.gstin = cleanText(req.body.gstin).toUpperCase();
    settings.phone = cleanText(req.body.phone) || settings.phone;
    settings.email = cleanText(req.body.email) || settings.email;
    settings.address = cleanText(req.body.address) || settings.address;
    settings.state = cleanText(req.body.state) || settings.state;

    settings.invoicePrefix =
      cleanText(req.body.invoicePrefix).toUpperCase() || settings.invoicePrefix;

    settings.defaultHsnCode =
      cleanText(req.body.defaultHsnCode) || settings.defaultHsnCode;

    settings.defaultGstPercent = Number(
      req.body.defaultGstPercent ?? settings.defaultGstPercent,
    );

    settings.terms = cleanText(req.body.terms) || settings.terms;
    settings.updatedBy = req.user?._id || null;

    await settings.save();

    return res.status(200).json({
      success: true,
      message: "Store invoice settings updated successfully.",
      settings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrCreateStoreSettings,
  getStoreSettingsAdmin,
  updateStoreSettingsAdmin,
};
