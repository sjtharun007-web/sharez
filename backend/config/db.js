const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('MONGO_URL:', process.env.MONGO_URL); // add this line
    const conn = await mongoose.connect(process.env.MONGO_URL)
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
