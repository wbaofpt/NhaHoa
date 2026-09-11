import { readFileSync } from "node:fs";
import { parse } from "dotenv";
import { MongoClient } from "mongodb";
export default async function cleanup() {
  const env = parse(readFileSync("backend/.env"));
  const database = process.env.MONGODB_DB_NAME;
  if (!database?.endsWith("_test"))
    throw new Error("E2E requires a separate MONGODB_DB_NAME ending in _test.");
  const client = new MongoClient(process.env.MONGODB_URI || env.MONGODB_URI);
  try {
    const db = client.db(database);
    await client.withSession((session) =>
      session.withTransaction(async () => {
        const filter = {
          recipient: { $in: ["Khách kiểm thử API", "Khách kiểm thử tự động"] },
          email: { $in: [/^test-.*@example\.com$/, "e2e@example.com"] },
        };
        const orders = await db
          .collection("orders")
          .find(filter, { session })
          .toArray();
        for (const order of orders) {
          if (order.status !== "cancelled")
            for (const item of order.items)
              await db
                .collection("products")
                .updateOne(
                  { id: item.product_id },
                  { $inc: { stock: item.quantity } },
                  { session },
                );
          await db
            .collection("orders")
            .deleteOne({ _id: order._id }, { session });
        }
        await db
          .collection("inquiries")
          .deleteMany(
            { name: "Khách kiểm thử API", email: /^test-.*@example\.com$/ },
            { session },
          );
        const users = await db
          .collection("users")
          .find(
            { name: "Khách kiểm thử API", email: /^test-.*@example\.com$/ },
            { session },
          )
          .toArray();
        await db
          .collection("sessions")
          .deleteMany(
            { user_id: { $in: users.map((u) => u.id) } },
            { session },
          );
        await db
          .collection("favorites")
          .deleteMany(
            { user_id: { $in: users.map((u) => u.id) } },
            { session },
          );
        await db
          .collection("users")
          .deleteMany({ _id: { $in: users.map((u) => u._id) } }, { session });
        await db
          .collection("products")
          .deleteMany(
            { slug: /^e2e-stock-/, name: "Hoa kiểm thử tồn kho" },
            { session },
          );
      }),
    );
  } finally {
    await client.close();
  }
}
