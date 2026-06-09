require('dotenv').config({path: '.env.local'});
const mongoose = require('mongoose');

async function clearDb() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    
    console.log('Connected to database. Clearing collections...');
    
    // Check if collections exist before dropping to avoid errors
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    if (collectionNames.includes('members')) {
      await db.collection('members').deleteMany({});
      console.log('Cleared members.');
    }
    
    if (collectionNames.includes('applications')) {
      await db.collection('applications').deleteMany({});
      console.log('Cleared applications.');
    }
    
    if (collectionNames.includes('projects')) {
      await db.collection('projects').deleteMany({});
      console.log('Cleared projects.');
    }
    
    if (collectionNames.includes('publications')) {
      await db.collection('publications').deleteMany({});
      console.log('Cleared publications.');
    }
    
    // We will not clear 'users' because that would delete the superadmin account.
    // If needed, we can clear only non-admin users.
    
    console.log('Database cleared successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
}

clearDb();
