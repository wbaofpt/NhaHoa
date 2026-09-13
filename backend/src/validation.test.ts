import { test } from "node:test";
import assert from "node:assert/strict";
import {
  checkoutInput,
  totals,
  transitions,
  todayVN,
  registration,
  productInput,
  registrationPhone,
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
  const user = { name: "Khách kiểm thử", email: "test@example.com", phone: "0901234567", phoneCode: "123456" };
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
test("registration normalizes Vietnamese mobile numbers and requires SMS verification", () => {
  for (const value of ["0901234567", "+84901234567", "090 123 4567", " (090) 123-4567 "])
    assert.equal(registrationPhone.parse(value), "+84901234567");
  for (const value of ["123", "+12025550123", "0241234567", "09012345678"])
    assert.equal(registrationPhone.safeParse(value).success, false);
  const user = { name: "Test User", email: "test@example.com", password: "My quiet garden blooms!", phone: "0901234567", phoneCode: "123456" };
  assert.equal(registration.safeParse(user).success, true);
  for (const phoneCode of [undefined, "", "12345", "1234567", "abcdef"])
    assert.equal(registration.safeParse({ ...user, phoneCode }).success, false);
  assert.equal(registration.safeParse({ ...user, phone: undefined }).success, false);
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
test("product images accept safe local data URLs and badges stay bounded", () => {
  const base = {
    name: "Hoa test",
    slug: "hoa-test",
    category: "Bó hoa",
    occasion: "Sinh nhật",
    price: 100000,
    description: "Mô tả sản phẩm đủ dài",
    flowers: "Hồng",
    stock: 1,
    active: true,
  };
  assert.equal(
    productInput.safeParse({
      ...base,
      image: "data:image/png;base64,AAAA",
      badge: "Mới về",
    }).success,
    true,
  );
  assert.equal(
    productInput.safeParse({ ...base, image: "data:text/html;base64,AAAA" })
      .success,
    false,
  );
  assert.equal(
    productInput.safeParse({
      ...base,
      image: "/images/rose.jpg",
      badge: "x".repeat(41),
    }).success,
    false,
  );
});
