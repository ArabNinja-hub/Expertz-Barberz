// Owner-confirmed business details belong here. Never substitute a fictional number.
export const business = {
  whatsappNumber: "WHATSAPP_NUMBER_TO_CONFIRM", // International digits only, no +, spaces, or leading zero.
  phone: "",
  address: "Alick Nkhata Rd, Lusaka 10101, Zambia",
  openingHours: "",
  socialLabel: "",
};

export function whatsappUrl(number, message) {
  if (!/^[1-9]\d{7,14}$/.test(number)) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
export function enquiryMessage(service) {
  if (service === "A general enquiry") {
    return "Hi Expertz Barber Shop! I’d like to enquire about an appointment. Could you please share your services, availability and pricing? Thank you.";
  }
  return `Hi Expertz Barber Shop! I’d like to enquire about ${service.toLowerCase()}. Could you please share your availability and pricing? Thank you.`;
}
