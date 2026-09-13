import { MongoClient } from "mongodb";
import { config } from "dotenv";
import { randomInt, createHash } from "node:crypto";
config({ path: "backend/.env", quiet: true });

// Seed an issued OTP only in the isolated test DB; production verification stays active.
export async function registrationCode() {
  const name = process.env.MONGODB_DB_NAME;
  if (process.env.NODE_ENV !== "test" || !name?.endsWith("_test"))
    throw new Error("OTP fixtures require an isolated test database");
  const client = new MongoClient(process.env.MONGODB_URI!);
  const phone = `+849${randomInt(10000000, 100000000)}`;
  const phoneCode = String(randomInt(100000, 1000000));
  try {
    await client.db(name).collection<{ _id: string; hash: string; sentAt: Date; expiresAt: Date; attempts: number }>("phone_verification_codes").insertOne({
      _id: phone,
      hash: createHash("sha256").update(phoneCode).digest("hex"),
      sentAt: new Date(), expiresAt: new Date(Date.now() + 600000), attempts: 0,
    });
    return { phone, phoneCode };
  } finally { await client.close(); }
}
