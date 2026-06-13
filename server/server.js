require("dotenv").config();

const dns = require("dns");

// Fix for MongoDB Atlas SRV DNS issues on some networks
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`VJJ Shop server running on port ${PORT}`);
});
