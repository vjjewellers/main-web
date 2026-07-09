const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "vjj-products",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      },
    );

    stream.end(fileBuffer);
  });
};

router.post(
  "/",
  protect,
  adminOnly,
  upload.single("image"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Image file is required.",
        });
      }

      const result = await uploadToCloudinary(req.file.buffer);

      return res.status(200).json({
        success: true,
        url: result.secure_url,
        secure_url: result.secure_url,
        publicId: result.public_id,
        public_id: result.public_id,
        image: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
