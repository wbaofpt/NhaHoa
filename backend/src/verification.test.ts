import { test } from "node:test";
import assert from "node:assert/strict";
import { sendSmsCode } from "./verification.js";

test("SMS transport sends the destination and code and rejects provider failures", async (t) => {
  const keys = ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_FROM_NUMBER"] as const;
  const previous = keys.map((key) => process.env[key]);
  t.after(() => keys.forEach((key, i) => {
    if (previous[i] === undefined) delete process.env[key];
    else process.env[key] = previous[i];
  }));
  keys.forEach((key) => delete process.env[key]);
  const fetchMock = t.mock.method(globalThis, "fetch", async (_url: unknown, options?: RequestInit) => {
    const body = options?.body as URLSearchParams;
    assert.equal(body.get("To"), "+84901234567");
    assert.equal(body.get("From"), "+15005550006");
    assert.match(body.get("Body")!, /123456/);
    assert.equal(options?.method, "POST");
    return new Response("{}", { status: 201 });
  });
  await assert.rejects(sendSmsCode("+84901234567", "123456"), /Twilio/);
  assert.equal(fetchMock.mock.callCount(), 0);
  process.env.TWILIO_ACCOUNT_SID = "ACtest";
  process.env.TWILIO_AUTH_TOKEN = "test-token";
  process.env.TWILIO_FROM_NUMBER = "+15005550006";
  await sendSmsCode("+84901234567", "123456");
  assert.equal(fetchMock.mock.callCount(), 1);
  fetchMock.mock.mockImplementation(async () => new Response("{}", { status: 400 }));
  await assert.rejects(sendSmsCode("+84901234567", "123456"));
});
