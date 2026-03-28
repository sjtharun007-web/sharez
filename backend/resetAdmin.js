const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URL).then(async () => {
  const User = require('./models/User');
  const hash = await bcrypt.hash('Admin@123', 10);
  const result = await User.findOneAndUpdate(
    { email: 'admin@sharez.com' },
    { password: hash },
    { new: true }
  );
  console.log('✅ Password reset for:', result.email);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});