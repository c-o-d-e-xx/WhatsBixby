const config = require("../../config");
const MONGODB_URI = config.MONGODB_URI;
const mongoose = require("mongoose");
console.log("MONGODB_URI:", typeof MONGODB_URI, MONGODB_URI);

function connectMongoDb() {
    if (!MONGODB_URI) {
        console.error("❌ MONGODB_URI is not defined in the configuration.");
        process.exit(1);
    }

    mongoose
        .connect(MONGODB_URI)
        .then(() => {
            console.log("✅ Successfully connected to MongoDB.");
        })
        .catch((error) => {
            console.error("❌ MongoDB connection error:", error.message);
            process.exit(1);
        });

    const db = mongoose.connection;

    db.on("error", (error) => {
        console.error("❌ MongoDB error occurred:", error.message);
    });
}

module.exports = { connectMongoDb };
