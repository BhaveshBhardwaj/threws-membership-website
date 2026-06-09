import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("Please define MONGODB_URI in .env.local");
  process.exit(1);
}

async function run() {
  console.log("Connecting to:", (uri as string).replace(/:([^@]+)@/, ":****@")); // hide password
  const client = new MongoClient(uri as string);
  try {
    await client.connect();
    console.log("✅ Successfully connected to MongoDB Atlas!");

    // List all databases
    const adminDb = client.db().admin();
    const dbsInfo = await adminDb.listDatabases();
    console.log("\n--- Databases found ---");
    for (const dbInfo of dbsInfo.databases) {
      const sizeMB = dbInfo.sizeOnDisk ? (dbInfo.sizeOnDisk / 1024 / 1024).toFixed(2) : "0.00";
      console.log(`- ${dbInfo.name} (${sizeMB} MB)`);
    }

    // For each database (except admin/local/config), list collections and count documents
    for (const dbInfo of dbsInfo.databases) {
      if (["admin", "config", "local"].includes(dbInfo.name)) continue;

      const db = client.db(dbInfo.name);
      const collections = await db.listCollections().toArray();
      console.log(`\n--- Database: ${dbInfo.name} collections ---`);
      if (collections.length === 0) {
        console.log("  No collections found.");
      }
      for (const col of collections) {
        const count = await db.collection(col.name).countDocuments();
        console.log(`  - ${col.name}: ${count} documents`);
        
        // If we found applications, print some metadata
        if (col.name === "applications" && count > 0) {
          const sample = await db.collection(col.name).find().limit(5).toArray();
          console.log(`    Sample applications:`);
          sample.forEach((app, i) => {
            console.log(`      [${i+1}] Name: ${app.fullName}, Email: ${app.email}, Type: ${app.type}, Status: ${app.status}`);
          });
        }

        // If we found users, print emails
        if (col.name === "users" && count > 0) {
          const users = await db.collection(col.name).find().toArray();
          console.log(`    Users in DB:`);
          users.forEach((user, i) => {
            console.log(`      [${i+1}] Name: ${user.name}, Email: ${user.email}, Role: ${user.role}`);
          });
        }
      }
    }

  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  } finally {
    await client.close();
  }
}

run();
