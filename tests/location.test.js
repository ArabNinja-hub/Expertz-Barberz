import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { business } from "../src/config.js";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../src/style.css", import.meta.url), "utf8");
const contact = html.match(/<section[^>]*id="contact"[\s\S]*?<\/section>/)?.[0];

test("contact embeds the exact resolved Google listing without an API key", () => {
  assert.ok(contact);
  const iframe = contact.match(/<iframe\b[\s\S]*?<\/iframe>/)?.[0];
  assert.ok(iframe);
  const src = iframe.match(/src="([^"]+)"/)[1].replaceAll("&amp;", "&");
  const url = new URL(src);
  assert.equal(url.origin, "https://www.google.com");
  assert.equal(url.pathname, "/maps/embed");
  assert.equal(url.searchParams.get("pb"), "!1m3!3m2!1m1!4s9709892129302366835");
  assert.equal(url.searchParams.has("key"), false);
  assert.match(iframe, /title="Expert Barberz location[^\"]+"/);
  assert.match(iframe, /loading="lazy"/);
  assert.match(iframe, /allowfullscreen/);
  assert.equal(business.address, "Alick Nkhata Rd, Lusaka 10101, Zambia");
});

test("directions opens the original supplied short link safely in a new tab", () => {
  const link = contact.match(/<a\b[^>]*id="directions-link"[\s\S]*?<\/a>/)?.[0];
  assert.ok(link);
  assert.match(link, /href="https:\/\/maps\.app\.goo\.gl\/etmV4ZRgt74oZT4a6"/);
  assert.match(link, /target="_blank"/);
  assert.match(link, /rel="noopener noreferrer"/);
  assert.match(link, />Get Directions /);
  assert.doesNotMatch(contact, /Map available once location is confirmed/);
});

test("map has responsive sizing, rounded corners and no interaction-blocking overlay", () => {
  assert.match(css, /\.location-map\s*\{[^}]*overflow:\s*hidden;[^}]*border-radius:\s*18px;/);
  assert.match(css, /\.location-map iframe\s*\{[^}]*width:\s*100%;[^}]*height:\s*clamp\(300px, 45vw, 450px\);/);
  assert.doesNotMatch(css, /\.location-map[^}]*pointer-events:\s*none/);
});
