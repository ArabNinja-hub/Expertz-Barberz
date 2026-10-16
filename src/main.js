import "@fontsource/manrope/latin-400.css";
import "@fontsource/manrope/latin-500.css";
import "@fontsource/manrope/latin-600.css";
import "@fontsource/manrope/latin-700.css";
import "@fontsource/barlow-condensed/latin-600.css";
import "./style.css";
import {
  createIcons,
  Scissors,
  ArrowUpRight,
  ArrowRight,
  ArrowDownRight,
  ArrowDown,
  ArrowUp,
  Menu,
  X,
  Asterisk,
  Zap,
  ScanFace,
  Info,
  Camera,
  Plus,
  Phone,
  MapPin,
  Clock3,
  Instagram,
  Copy,
} from "lucide";
import { business, whatsappUrl, enquiryMessage } from "./config.js";
createIcons({
  icons: {
    Scissors,
    ArrowUpRight,
    ArrowRight,
    ArrowDownRight,
    ArrowDown,
    ArrowUp,
    Menu,
    X,
    Asterisk,
    Zap,
    ScanFace,
    Info,
    Camera,
    Plus,
    Phone,
    MapPin,
    Clock3,
    Instagram,
    Copy,
  },
});
const $ = (s) => document.querySelector(s);
const menu = $("#mobile-nav");
const toggle = $(".menu-toggle");
function closeMenu() {
  // A hidden menu item cannot receive focus when a dialog closes.
  if (menu.contains(document.activeElement)) toggle.focus();
  menu.hidden = true;
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "Open navigation");
}
toggle.addEventListener("click", () => {
  const open = menu.hidden;
  menu.hidden = !open;
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute(
    "aria-label",
    open ? "Close navigation" : "Open navigation",
  );
});
menu
  .querySelectorAll("a, button")
  .forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !menu.hidden) {
    closeMenu();
    toggle.focus();
  }
});
document.addEventListener("click", (e) => {
  if (!e.target.closest(".site-header")) closeMenu();
});
matchMedia("(min-width: 1001px)").addEventListener("change", (e) => {
  if (e.matches) closeMenu();
});
const observer = new IntersectionObserver(
  (entries) =>
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        document.querySelectorAll(".desktop-nav a").forEach((a) => {
          const active = a.hash === `#${entry.target.id}`;
          a.classList.toggle("active", active);
          if (active) a.setAttribute("aria-current", "location");
          else a.removeAttribute("aria-current");
        });
      }
    }),
  { rootMargin: "-15% 0px -65% 0px", threshold: 0 },
);
document
  .querySelectorAll("main section[id]")
  .forEach((section) => observer.observe(section));
const details = {
  phone: business.phone || "Number to be confirmed",
  whatsapp: whatsappUrl(business.whatsappNumber, "")
    ? `+${business.whatsappNumber}`
    : "Number to be confirmed",
  address: business.address || "Shop address to be confirmed.",
  hours: business.openingHours || "Opening hours to be confirmed.",
  social: business.socialLabel || "Social links coming after confirmation",
};
for (const [key, value] of Object.entries(details))
  $(`[data-detail="${key}"]`).textContent = value;
const booking = $("#booking-dialog");
function updateLink() {
  const url = whatsappUrl(business.whatsappNumber, $("#enquiry").value);
  const link = $("#whatsapp-link");
  const hasMessage = $("#enquiry").value.trim().length > 0;
  link.hidden = !url || !hasMessage;
  $("#copy-message").disabled = !hasMessage;
  $("#copy-status").textContent = hasMessage
    ? ""
    : "Add a message to prepare your enquiry.";
  if (url) link.href = url;
  else link.removeAttribute("href");
  $("#whatsapp-status").textContent = url
    ? "This opens WhatsApp. Availability and pricing must be confirmed directly with the shop."
    : "Demo preview: the shop’s WhatsApp number has not been confirmed. Nothing will be sent. You can copy the draft message below.";
}
document.querySelectorAll("[data-book]").forEach((button) =>
  button.addEventListener("click", () => {
    $("#service").value = button.dataset.service || "A general enquiry";
    $("#enquiry").value = enquiryMessage($("#service").value);
    $("#copy-status").textContent = "";
    updateLink();
    booking.showModal();
  }),
);
$("#service").addEventListener("change", () => {
  $("#enquiry").value = enquiryMessage($("#service").value);
  updateLink();
});
$("#enquiry").addEventListener("input", updateLink);
$("#copy-message").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText($("#enquiry").value);
    $("#copy-status").textContent = "Enquiry copied. No message has been sent.";
  } catch {
    $("#enquiry").focus();
    $("#enquiry").select();
    $("#copy-status").textContent =
      "Please copy the selected message using your device’s copy command.";
  }
});
document.querySelectorAll("dialog").forEach((dialog) => {
  dialog
    .querySelector("[data-close]")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    const r = dialog.getBoundingClientRect();
    if (
      event.target === dialog &&
      (event.clientX < r.left ||
        event.clientX > r.right ||
        event.clientY < r.top ||
        event.clientY > r.bottom)
    )
      dialog.close();
  });
});
document.querySelectorAll("[data-photo]").forEach((button) =>
  button.addEventListener("click", () => {
    const image = button.querySelector("img");
    $("#expanded-photo").src = image.src;
    $("#expanded-photo").alt = image.alt;
    $("#photo-title").textContent =
      button.querySelector(".gallery-title").textContent;
    $("#photo-dialog").showModal();
  }),
);
$("#demo-details").addEventListener("click", () =>
  $("#demo-dialog").showModal(),
);
