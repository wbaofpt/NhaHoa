import "dotenv/config";
import { MongoClient, type ClientSession } from "mongodb";
import type { z } from "zod";
import { productInput } from "./validation.js";
if (!process.env.MONGODB_URI)
  throw new Error("Thiếu MONGODB_URI trong backend/.env");
export const client = new MongoClient(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 15000,
  maxPoolSize: 10,
});
export const db = client.db(process.env.MONGODB_DB_NAME || "nha_hoa");
export type User = {
  id: number;
  name: string;
  email: string;
  role: "customer" | "admin";
  banned?: boolean;
  phone?: string;
  address?: string;
  password_hash: string;
  session_version?: number;
  created_at: Date;
};
export type Product = z.infer<typeof productInput> & {
  id: number;
  created_at: Date;
};
export type OrderItem = {
  product_id: number;
  quantity: number;
  price: number;
  name: string;
  image: string;
};
export type Order = {
  id: string;
  user_id: number | null;
  recipient: string;
  phone: string;
  email: string;
  address: string;
  delivery_date: string;
  message: string;
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  payment_method: "cod";
  created_at: Date;
  items: OrderItem[];
};
export const users = db.collection<User>("users");
export const products = db.collection<Product>("products");
export const orders = db.collection<Order>("orders");
export const sessions = db.collection<{
  token_hash: string;
  session_version?: number;
  user_id: number;
  expires_at: Date;
}>("sessions");
export const inquiries = db.collection<{
  resolved?: boolean;
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: Date;
}>("inquiries");
export const subscribers = db.collection<{ email: string; created_at: Date }>(
  "subscribers",
);
export const counters = db.collection<{ _id: string; value: number }>(
  "counters",
);
export const publicFields = { projection: { _id: 0 } };
export const favorites = db.collection<{
  user_id: number;
  product_id: number;
  created_at: Date;
}>("favorites");
export type Article = { slug: string; title: string; category: string; intro: string; image: string; sections: string[][]; updated_at: Date };
export const articles = db.collection<Article>("articles");
export async function nextId(name: string) {
  const counter = await counters.findOneAndUpdate(
    { _id: name },
    { $inc: { value: 1 } },
    { upsert: true, returnDocument: "after" },
  );
  return counter!.value;
}
export async function transaction<T>(
  work: (session: ClientSession) => Promise<T>,
): Promise<T> {
  return client.withSession((session) =>
    session.withTransaction(() => work(session), {
      readConcern: { level: "snapshot" },
      writeConcern: { w: "majority" },
      readPreference: "primary",
    }),
  );
}
export function safeDatabaseError(error: unknown) {
  // Never log driver messages: they may include connection details.
  const value = error as { name?: string; code?: number | string };
  return { name: value?.name || "Error", code: value?.code };
}
