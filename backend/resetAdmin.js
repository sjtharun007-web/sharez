const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URL).then(async () => {
  const User = require('./models/User');
  await User.deleteMany({ role: 'admin' });
  await User.create({
    name: 'Admin',
    email: 'admin@sharez.com',
    password: 'Admin@123',
    role: 'admin'
  });
  console.log('✅ Admin created: admin@sharez.com / Admin@123');
  process.exit(0);
}).catch(err => {
  console.error(err.message);
  process.exit(1);
});