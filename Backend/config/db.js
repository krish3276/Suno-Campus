const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed through app termination");
      process.exit(0);
    });

  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    console.error(`\n🔧 Common solutions:`);
    console.error(`1. Check if your IP is whitelisted in MongoDB Atlas`);
    console.error(`2. Go to: https://cloud.mongodb.com/`);
    console.error(`3. Navigate to: Network Access → Add IP Address`);
    console.error(`4. Add your current IP or use 0.0.0.0/0 for development (allows all IPs)`);
    console.error(`5. Verify your connection string in .env file\n`);
    
    // Don't exit process, let server run without DB for troubleshooting
    // process.exit(1);
  }
};

module.exports = connectDB;
