import type { Collection } from "mongodb";
import { code, digest, sendSmsCode } from "./verification.js";

export type PhoneCode = {
  _id: string;
  hash: string | null;
  sentAt: Date;
  expiresAt: Date;
  attempts: number;
};

export class PhoneVerificationError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function requestPhoneCode(records: Collection<PhoneCode>, phone: string) {
  const now = new Date();
  const value = code();
  // Reserve the cooldown atomically, including while the SMS request is in flight.
  try {
    await records.updateOne(
      { _id: phone, sentAt: { $lte: new Date(now.getTime() - 60000) } },
      { $set: { hash: null, sentAt: now, expiresAt: new Date(now.getTime() + 600000), attempts: 0 } },
      { upsert: true },
    );
  } catch (error) {
    if ((error as { code?: number }).code === 11000)
      throw new PhoneVerificationError("Vui lòng chờ một phút trước khi gửi lại mã SMS.", 429);
    throw error;
  }
  try {
    await sendSmsCode(phone, value);
  } catch {
    throw new PhoneVerificationError("Chưa thể gửi SMS xác minh. Vui lòng thử lại sau hoặc liên hệ Nhà Hoa.", 503);
  }
  await records.updateOne({ _id: phone, sentAt: now }, { $set: { hash: digest(value) } });
}

export async function consumePhoneCode(records: Collection<PhoneCode>, phone: string, value: string) {
  const record = await records.findOneAndUpdate(
    { _id: phone, hash: { $ne: null }, expiresAt: { $gt: new Date() }, attempts: { $lt: 5 } },
    { $inc: { attempts: 1 } },
    { returnDocument: "after" },
  );
  if (record && record.hash === digest(value)) {
    const result = await records.updateOne(
      { _id: phone, hash: record.hash, sentAt: record.sentAt, expiresAt: { $gt: new Date() }, attempts: { $lte: 5 } },
      { $set: { hash: null } },
    );
    if (result.modifiedCount === 1) return;
  }
  throw new PhoneVerificationError("Mã SMS không đúng, đã hết hạn hoặc đã dùng. Bạn có tối đa 5 lần thử; hãy gửi lại mã nếu cần.", 400);
}
