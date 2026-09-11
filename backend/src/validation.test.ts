import { test } from "node:test";
import assert from "node:assert/strict";
import {
  checkoutInput,
  totals,
  transitions,
  todayVN,
  registration,
} from "./validation.js";
test("shipping fee threshold and total are calculated using integer VND", () => {
  assert.deepEqual(totals([{ price: 350000, quantity: 2 }]), {
    subtotal: 700000,
    shipping: 35000,
    total: 735000,
  });
  assert.deepEqual(totals([{ price: 400000, quantity: 2 }]), {
    subtotal: 800000,
    shipping: 0,
    total: 800000,
  });
});
const valid = {
  recipient: "Khách kiểm thử",
  phone: "0901234567",
  email: "test@example.com",
  address: "123 Nguyễn Huệ, TP. Hồ Chí Minh",
  delivery_date: todayVN(),
  message: "",
  payment_method: "cod",
  items: [{ product_id: 1, quantity: 1 }],
};
test("registration requires a long password and rejects bcrypt truncation", () => {
  const user = { name: "Khách kiểm thử", email: "test@example.com" };
  assert.equal(
    registration.safeParse({ ...user, password: "shortpass" }).success,
    false,
  );
  assert.equal(
    registration.safeParse({ ...user, password: "é".repeat(40) }).success,
    false,
  );
  assert.equal(
    registration.safeParse({ ...user, password: "My quiet garden blooms!" })
      .success,
    true,
  );
});
test("checkout rejects zero, negative, excessive and duplicate quantities", () => {
  for (const quantity of [0, -1, 21, 1.5])
    assert.equal(
      checkoutInput.safeParse({
        ...valid,
        items: [{ product_id: 1, quantity }],
      }).success,
      false,
    );
  assert.equal(
    checkoutInput.safeParse({
      ...valid,
      items: [
        { product_id: 1, quantity: 1 },
        { product_id: 1, quantity: 1 },
      ],
    }).success,
    false,
  );
});
test("checkout rejects past and impossible dates", () => {
  for (const delivery_date of ["2020-01-01", "2030-02-31", "2030-13-01"])
    assert.equal(
      checkoutInput.safeParse({ ...valid, delivery_date }).success,
      false,
    );
});
test("checkout strips customer prices and validates contacts", () => {
  const result = checkoutInput.parse({
    ...valid,
    total: 1,
    items: [{ product_id: 1, quantity: 1, price: 1 }],
  });
  assert.equal("total" in result, false);
  assert.equal("price" in result.items[0], false);
  assert.equal(
    checkoutInput.safeParse({ ...valid, phone: "123" }).success,
    false,
  );
  assert.equal(
    checkoutInput.safeParse({ ...valid, email: "invalid" }).success,
    false,
  );
});
test("terminal orders cannot be cancelled or reopened", () => {
  assert.deepEqual(transitions.delivered, []);
  assert.deepEqual(transitions.cancelled, []);
  assert.equal(transitions.shipping.includes("cancelled"), false);
});
