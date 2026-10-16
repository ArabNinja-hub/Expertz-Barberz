import test from "node:test";
import assert from "node:assert/strict";
import { business, whatsappUrl, enquiryMessage } from "../src/config.js";
test("unconfirmed WhatsApp cannot produce a live link", () => {
  assert.equal(whatsappUrl(business.whatsappNumber, "Hello"), null);
  for (const invalid of [
    "",
    "+260 123",
    "000000000",
    "WHATSAPP_NUMBER_TO_CONFIRM",
    "https://example.com",
  ])
    assert.equal(whatsappUrl(invalid, "Hello"), null);
});
test("WhatsApp format and message encoding (synthetic number, never published)", () => {
  const message = enquiryMessage("Fades & Line-ups");
  const url = new URL(whatsappUrl("1234567890", message));
  assert.equal(url.origin, "https://wa.me");
  assert.equal(url.pathname, "/1234567890");
  assert.equal(url.searchParams.get("text"), message);
  assert.ok(message.includes("availability and pricing"));
});

test("general enquiry is a request, never a booking confirmation", () => {
  const message = enquiryMessage("A general enquiry");
  assert.ok(message.includes("enquire about an appointment"));
  assert.ok(message.includes("availability and pricing"));
  assert.ok(!message.includes("about a general enquiry"));
  assert.ok(!/confirmed|scheduled|reserved/i.test(message));
});
