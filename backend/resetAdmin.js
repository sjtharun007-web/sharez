const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URL).then(async () => {
  const User = require('./models/User');
  const hash = await bcrypt.hash('Admin@123', 10);
  await User.findOneAndUpdate({ email: 'admin@campus.com' }, { password: hash });
  console.log('✅ Password reset to Admin@123');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});