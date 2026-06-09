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
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to MongoDB...");
    const db = client.db();

    // Check if the member already exists
    const existing = await db.collection("members").findOne({ membershipId: "THR-F-2026-001" });
    if (!existing) {
      const testMember = {
        membershipId: "THR-F-2026-001",
        type: "fellow",
        status: "active",
        fullName: "Dr. Sarah Jenkins",
        email: "sarah.jenkins@gmail.com",
        phone: "+919876543210",
        institution: "Vance Institute of Technology",
        designation: "Professor",
        department: "Computer Science",
        researchAreas: ["Internet of Things", "Blockchain", "Cybersecurity"],
        photoUrl: "",
        bio: "Dr. Sarah Jenkins is a veteran researcher in decentralized security frameworks and IoT telemetry networks. She has authored over 40 publications and acts as an academic advisor at Westbridge Research.",
        orgEmail: "sarah.jenkins.wbr@gmail.com",
        orgEmailStatus: "active",
        skills: ["Security Architecture", "Smart Contracts", "Phased Antenna Arrays"],
        joinedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.collection("members").insertOne(testMember);
      console.log("Test member created: THR-F-2026-001");
    } else {
      console.log("Test member THR-F-2026-001 already exists.");
    }
  } catch (error) {
    console.error("Error creating test member:", error);
  } finally {
    await client.close();
  }
}

run();
