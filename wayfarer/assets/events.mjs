export const DIRECT_CALL = "travel-demo-event";
export const TAGS_URL = "https://assets.adobedtm.com/6a203c8a0ff8/b76c0d51061c/launch-3872e5b57f11-development.min.js";
export const CONTENT_VERSION = "wayfarer-1.0";

export function pageEvent(name, url) {
  return {
    eventType: "web.webpagedetails.pageViews",
    web: { webPageDetails: { name, URL: url, pageViews: { value: 1 } } }
  };
}

export function interactionEvent(name, url) {
  return {
    eventType: "web.webinteraction.linkClicks",
    web: { webInteraction: { name, URL: url, type: "other", linkClicks: { value: 1 } } }
  };
}

function product(destination, quantity) {
  return {
    SKU: `TRIP-${destination.id.toUpperCase()}`,
    name: `${destination.name} ${destination.days}-day escape`,
    quantity,
    priceTotal: destination.price * quantity
  };
}

export function checkoutEvent(destination, quantity) {
  return {
    eventType: "commerce.checkouts",
    commerce: { checkouts: { value: 1 } },
    productListItems: [product(destination, quantity)]
  };
}

export function purchaseEvent(destination, receipt) {
  if (!Number.isInteger(receipt.quantity) || receipt.quantity < 1 || receipt.quantity > 6 ||
      !/^DEMO-[a-f0-9-]{36}$/.test(receipt.id)) {
    throw new Error("Invalid demo receipt");
  }
  return {
    eventType: "commerce.purchases",
    commerce: {
      purchases: { value: 1 },
      order: {
        purchaseID: receipt.id,
        priceTotal: destination.price * receipt.quantity,
        currencyCode: "GBP"
      }
    },
    productListItems: [product(destination, receipt.quantity)]
  };
}

export function receiptMatches(receipt, destination) {
  return Boolean(receipt && destination && receipt.destination === destination.id &&
    Number.isInteger(receipt.quantity) && receipt.quantity >= 1 && receipt.quantity <= 6 &&
    typeof receipt.id === "string" && /^DEMO-[a-f0-9-]{36}$/.test(receipt.id));
}
