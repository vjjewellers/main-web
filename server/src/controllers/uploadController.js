const uploadSingleImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully.",
      image: {
        url: req.file.path,
        publicId: req.file.filename,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadSingleImage,
};
