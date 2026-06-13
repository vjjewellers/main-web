function generateOrderNumber() {
  const date = new Date();
  const ymd = date.toISOString().slice(0, 10).replaceAll("-", "");
  const random = Math.floor(100000 + Math.random() * 900000);

  return `VJJ-${ymd}-${random}`;
}

module.exports = generateOrderNumber;
