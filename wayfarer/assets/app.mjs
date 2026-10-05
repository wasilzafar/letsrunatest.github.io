import { findDestination, money } from "./catalog.mjs";
import { pageEvent, interactionEvent, checkoutEvent, purchaseEvent, receiptMatches } from "./events.mjs";
import { Tracker, loadTags } from "./tracking.mjs";
import { normalizeBasePath, sitePath } from "./paths.mjs";

const basePath = normalizeBasePath(document.body.dataset.basePath || "/");
const route = path => sitePath(basePath, path);
const page = document.body.dataset.page;
const destination = findDestination(document.body.dataset.destination);
const receiptKey = "wayfarer:receipt:v1";
const status = document.querySelector("#tracking-status");
const banner = document.querySelector("#consent-banner");
let receipt = null;
let sessionStore, consentStore;

function reportError(error) {
  console.error("[Wayfarer demo]", error);
  status.textContent = `Demo error: ${error.message}`;
}

try {
  sessionStore = window.sessionStorage;
  consentStore = window.localStorage;
  receipt = JSON.parse(sessionStore.getItem(receiptKey) || "null");
} catch (error) {
  reportError(error);
}

const tracker = new Tracker({
  storage: sessionStore,
  consentStorage: consentStore,
  loadLibrary: () => loadTags(document),
  getSatellite: () => window._satellite,
  onStatus: message => { status.textContent = message; },
  onLog: entries => {
    const log = document.querySelector("#event-log");
    if (log) log.textContent = entries.length ? JSON.stringify(entries, null, 2) : "No events yet.";
  }
});

function emit(xdm, purchaseID) {
  return tracker.enqueue({
    ...xdm, _id: crypto.randomUUID(), timestamp: new Date().toISOString()
  }, purchaseID);
}

let captured = false;
function capturePage() {
  if (captured || tracker.consent !== "allowed") return;
  captured = true;
  if (page === "setup" || page === "not-found") return;
  emit(pageEvent(document.title, `${location.origin}${location.pathname}`));
  if (page === "explore" && location.pathname !== route("/explore/")) {
    emit(interactionEvent(`Travel style: ${document.querySelector("#theme").value}`, location.href));
  }
  if (page === "itinerary") emit(interactionEvent(`Itinerary selected: ${destination.name}`, location.href));
  if (page === "booking") emit(checkoutEvent(destination, 1));
  if (page === "confirmation" && receiptMatches(receipt, destination)) {
    emit(purchaseEvent(destination, receipt), receipt.id);
  }
}

function startAnalytics() {
  const loading = tracker.allow();
  if (tracker.consent === "allowed") {
    banner.hidden = true;
    capturePage();
  }
  loading.then(loaded => {
    const detail = document.querySelector("#library-detail");
    if (detail) detail.textContent = loaded
      ? "Tags loaded. Confirm the direct-call rule and network delivery independently."
      : "Library not ready. See the analytics status and browser console.";
  });
}

if (tracker.consent === "allowed") startAnalytics();
else if (tracker.consent === "denied") status.textContent = "Analytics declined";
else banner.hidden = false;

document.querySelector("#accept-analytics").addEventListener("click", startAnalytics);
document.querySelector("#decline-analytics").addEventListener("click", () => {
  const previouslyAllowed = tracker.consent === "allowed";
  if (tracker.decline()) {
    banner.hidden = true;
    // Reload unloads the already-running Adobe library after consent withdrawal.
    if (previouslyAllowed) location.reload();
  }
});
document.querySelector("#privacy-settings").addEventListener("click", () => {
  banner.hidden = false;
  document.querySelector("#decline-analytics").focus();
});
document.querySelector("#clear-log")?.addEventListener("click", () => tracker.clearLog());

const filters = document.querySelector(".filters");
filters?.addEventListener("submit", event => {
  event.preventDefault();
  const theme = document.querySelector("#theme").value;
  location.assign(route(theme === "All" ? "/explore/" : `/explore/${theme.toLowerCase()}/`));
});

const travelers = document.querySelector("#travelers");
travelers?.addEventListener("change", () => {
  document.querySelector("#booking-total").textContent = money(destination.price * Number(travelers.value));
});
document.querySelector("#booking-form")?.addEventListener("submit", event => {
  event.preventDefault();
  const quantity = Number(travelers.value);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 6) {
    document.querySelector("#booking-error").textContent = "Choose between one and six travelers.";
    return;
  }
  try {
    const nextReceipt = { id: `DEMO-${crypto.randomUUID()}`, destination: destination.id, quantity };
    sessionStore.setItem(receiptKey, JSON.stringify(nextReceipt));
    location.assign(route(`/confirmation/${destination.id}/`));
  } catch (error) {
    reportError(error);
    document.querySelector("#booking-error").textContent = "The demo receipt could not be saved. Enable session storage and try again.";
  }
});

if (page === "confirmation" && receiptMatches(receipt, destination)) {
  document.querySelector("#receipt-message").textContent = "Your simulated journey is confirmed. No payment or reservation has been made.";
  document.querySelector("#receipt-details").hidden = false;
  document.querySelector("#receipt-number").textContent = `Demo reference: ${receipt.id}`;
  document.querySelector("#receipt-total").textContent = `${receipt.quantity} ${receipt.quantity === 1 ? "traveler" : "travelers"} / ${money(destination.price * receipt.quantity)} total (GBP)`;
}
