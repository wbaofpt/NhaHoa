import { readFile } from "node:fs/promises";
import bcrypt from "bcryptjs";
import type { IndexDescription } from "mongodb";
import {
  client,
  db,
  products,
  users,
  counters,
  nextId,
  safeDatabaseError,
  type Product,
} from "./db.js";
import { productInput } from "./validation.js";
try {
  await client.connect();
  const indexes: Record<string, IndexDescription[]> = JSON.parse(
    await readFile(
      new URL("../../database/indexes.json", import.meta.url),
      "utf8",
    ),
  );
  for (const [name, definitions] of Object.entries(indexes))
    await db.collection(name).createIndexes(definitions);
  const catalog: Product[] = JSON.parse(
    await readFile(
      new URL("../../database/seed.json", import.meta.url),
      "utf8",
    ),
  );
  for (const product of catalog) {
    const input = productInput.parse(product);
    await products.updateOne(
      { slug: input.slug },
      { $setOnInsert: { ...input, id: product.id, created_at: new Date() } },
      { upsert: true },
    );
  }
  for (const name of ["products", "users", "inquiries"]) {
    const highest = await db
      .collection(name)
      .find()
      .sort({ id: -1 })
      .limit(1)
      .next();
    await counters.updateOne(
      { _id: name },
      { $max: { value: highest?.id || 0 } },
      { upsert: true },
    );
  }
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    if (process.env.ADMIN_PASSWORD.length < 12)
      throw new Error("ADMIN_PASSWORD cần ít nhất 12 ký tự");
    const email = process.env.ADMIN_EMAIL.toLowerCase();
    if (!(await users.findOne({ email })))
      await users.insertOne({
        id: await nextId("users"),
        name: "Nhà Hoa Admin",
        email,
        password_hash: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12),
        role: "admin",
        created_at: new Date(),
      });
  }
  console.log(
    "MongoDB indexes, catalog and admin are ready. Existing records preserved.",
  );
} catch (error) {
  console.error("MongoDB setup failed", safeDatabaseError(error));
  process.exitCode = 1;
} finally {
  await client.close();
}
