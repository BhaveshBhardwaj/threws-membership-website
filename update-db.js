require('dotenv').config({path: '.env.local'});
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  await db.collection('members').updateMany(
    { type: 'fellow' },
    { $set: { isHallOfFame: true } }
  );
  console.log('Updated members.');
  process.exit(0);
}).catch(console.error);
