function calculateShipping(subtotal, pincode) {
  if (subtotal >= 50000) return 0;

  const pin = String(pincode || "");

  if (pin.startsWith("27")) {
    return 80; // nearby/local UP region
  }

  if (pin.startsWith("2")) {
    return 120; // North India
  }

  return 180; // rest of India
}

module.exports = calculateShipping;
