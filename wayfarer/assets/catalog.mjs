export const destinations = [
  {
    id: "bali", name: "Bali", country: "Indonesia", theme: "Beach",
    title: "Find your own island rhythm.",
    summary: "Slow mornings, turquoise coves, and a little room for the unexpected.",
    description: "Follow the coastline from quiet fishing villages to sheltered beaches. Spend the morning exploring, then trade your itinerary for a long lunch and an ocean view. Our island escape leaves plenty of space to make the journey your own.",
    days: 7, price: 1480, color: "coast",
    highlights: ["Coastal walks", "Village markets", "Sunset by the sea"],
    itinerary: ["Arrive and settle into island life", "Discover secluded beaches", "Explore the village markets", "Take a coastal walk", "Enjoy a free day by the ocean", "Share a sunset dinner", "One last slow morning"]
  },
  {
    id: "kyoto", name: "Kyoto", country: "Japan", theme: "Culture",
    title: "Take the beautiful way around.",
    summary: "Lantern-lit lanes, peaceful gardens, and stories around every corner.",
    description: "Walk through Kyoto at a gentler pace. Discover garden paths, traditional streets, and the everyday craft of a city that rewards curiosity. Our culture-led journey pairs guided discovery with afternoons free for your own small adventures.",
    days: 5, price: 1890, color: "culture",
    highlights: ["Garden walks", "Local food trails", "Traditional streets"],
    itinerary: ["Meet Kyoto and its old streets", "Walk the gardens and temple district", "Follow a local food trail", "Discover craft and quiet courtyards", "A final morning of exploration"]
  },
  {
    id: "dolomites", name: "Dolomites", country: "Italy", theme: "Adventure",
    title: "A little higher. A little freer.",
    summary: "Big mountain views, fresh alpine air, and paths worth following.",
    description: "Leave the rush behind and head for the mountains. Follow alpine trails, pause beside clear lakes, and finish the day with a warm meal in a mountain village. This adventure is about the views and the moments between them.",
    days: 6, price: 1720, color: "alpine",
    highlights: ["Alpine trails", "Lakeside picnics", "Mountain villages"],
    itinerary: ["Arrive in the mountains", "Explore the valley trails", "Hike to an alpine lake", "Rest and discover a village", "Take the panoramic trail", "Leave with a new perspective"]
  },
  {
    id: "marrakech", name: "Marrakech", country: "Morocco", theme: "Culture",
    title: "Let curiosity lead the way.",
    summary: "Warm colors, lively markets, and a welcome you will remember.",
    description: "Step into a city of warm courtyards, intricate craft, and generous hospitality. Wander the markets with a local guide, learn the story behind a shared meal, and enjoy a relaxed afternoon in a garden. Every day brings a different point of view.",
    days: 4, price: 960, color: "desert",
    highlights: ["Market discovery", "Garden afternoons", "Local cooking"],
    itinerary: ["Discover the old city", "Explore the markets and craft lanes", "Share a cooking experience", "Enjoy a garden morning"]
  }
];

export const themes = ["All", "Beach", "Culture", "Adventure"];
export const money = value => new Intl.NumberFormat("en-GB", {
  style: "currency", currency: "GBP", maximumFractionDigits: 0
}).format(value);

export function findDestination(id) {
  return destinations.find(destination => destination.id === id);
}
