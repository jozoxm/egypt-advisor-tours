const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/egypt-advisor-tours';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const tourSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  rating: { type: Number, default: 5 },
  highlights: [String],
  included: [String],
  itinerary: [{ day: Number, description: String }],
  featured: { type: Boolean, default: false }
});

const Tour = mongoose.model('Tour', tourSchema);

const sampleTours = [
  {
    title: "Pyramids of Giza & Sphinx Tour",
    description: "Explore the magnificent Pyramids of Giza and the Great Sphinx, one of the Seven Wonders of the Ancient World. This half-day tour includes a knowledgeable guide who will share the fascinating history of these iconic monuments.",
    price: 75,
    duration: "Half Day",
    image: "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=800",
    category: "Historical",
    rating: 4.9,
    featured: true,
    highlights: [
      "Visit the Great Pyramid of Khufu",
      "See the Sphinx up close",
      "Learn about ancient Egyptian history",
      "Photo opportunities at panoramic viewpoints"
    ],
    included: [
      "Professional English-speaking guide",
      "Air-conditioned transportation",
      "Hotel pickup and drop-off",
      "Bottled water"
    ],
    itinerary: [
      { day: 1, description: "Meet your guide at your hotel and drive to Giza. Visit the three pyramids and the Sphinx. Enjoy panoramic views and photo stops. Return to hotel." }
    ]
  },
  {
    title: "Nile River Cruise",
    description: "Experience the beauty of the Nile River on a relaxing cruise. Enjoy stunning views, traditional Egyptian cuisine, and live entertainment as you sail along this historic waterway.",
    price: 120,
    duration: "Full Day",
    image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800",
    category: "Cruise",
    rating: 4.8,
    featured: true,
    highlights: [
      "Scenic Nile River cruise",
      "Traditional Egyptian lunch buffet",
      "Live folkloric show",
      "Belly dancing performance"
    ],
    included: [
      "Cruise ticket",
      "Lunch buffet",
      "Live entertainment",
      "Hotel pickup and drop-off",
      "English-speaking guide"
    ],
    itinerary: [
      { day: 1, description: "Board the cruise boat and enjoy a full day sailing the Nile. Savor a delicious lunch while watching traditional performances. Return to your hotel in the evening." }
    ]
  },
  {
    title: "Egyptian Museum & Old Cairo Tour",
    description: "Discover Egypt's rich history at the Egyptian Museum, home to over 120,000 artifacts including Tutankhamun's treasures. Continue to Old Cairo to explore Coptic and Islamic landmarks.",
    price: 90,
    duration: "Full Day",
    image: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800",
    category: "Historical",
    rating: 4.7,
    featured: true,
    highlights: [
      "Egyptian Museum with Tutankhamun's collection",
      "Hanging Church",
      "Ben Ezra Synagogue",
      "Sultan Hassan Mosque"
    ],
    included: [
      "Museum entrance fees",
      "Professional guide",
      "Transportation",
      "Lunch at local restaurant",
      "Hotel transfers"
    ],
    itinerary: [
      { day: 1, description: "Start at the Egyptian Museum, then visit Coptic Cairo including the Hanging Church and Ben Ezra Synagogue. End with Islamic Cairo landmarks. Lunch included." }
    ]
  },
  {
    title: "Luxor Day Trip from Cairo",
    description: "Fly to Luxor for a day of exploring the Valley of the Kings, Karnak Temple, and other magnificent monuments. This comprehensive tour showcases the best of ancient Thebes.",
    price: 350,
    duration: "Full Day",
    image: "https://images.unsplash.com/photo-1572252009406-8f2e0a5e4d96?w=800",
    category: "Adventure",
    rating: 5.0,
    featured: true,
    highlights: [
      "Round-trip flights from Cairo",
      "Valley of the Kings",
      "Temple of Hatshepsut",
      "Karnak Temple Complex",
      "Colossi of Memnon"
    ],
    included: [
      "Domestic flights",
      "Egyptologist guide",
      "All entrance fees",
      "Lunch",
      "All transfers"
    ],
    itinerary: [
      { day: 1, description: "Early morning flight to Luxor. Visit Valley of the Kings, Temple of Hatshepsut, Colossi of Memnon, and Karnak Temple. Lunch at local restaurant. Evening flight back to Cairo." }
    ]
  },
  {
    title: "Alexandria Day Tour",
    description: "Visit the Mediterranean city of Alexandria, founded by Alexander the Great. Explore the Catacombs, Pompey's Pillar, Qaitbay Citadel, and the modern Bibliotheca Alexandrina.",
    price: 110,
    duration: "Full Day",
    image: "https://images.unsplash.com/photo-1539768942893-daf53e448371?w=800",
    category: "Historical",
    rating: 4.6,
    featured: true,
    highlights: [
      "Catacombs of Kom El Shoqafa",
      "Pompey's Pillar",
      "Qaitbay Citadel",
      "Bibliotheca Alexandrina",
      "Mediterranean coastline"
    ],
    included: [
      "Transportation",
      "Professional guide",
      "Entrance fees",
      "Seafood lunch",
      "Hotel pickup and drop-off"
    ],
    itinerary: [
      { day: 1, description: "Drive to Alexandria along the desert highway. Visit the Catacombs, Pompey's Pillar, and Qaitbay Citadel. Lunch by the sea. Tour the modern Library of Alexandria before returning to Cairo." }
    ]
  },
  {
    title: "Saqqara & Memphis Tour",
    description: "Visit the Step Pyramid of Djoser at Saqqara, the oldest pyramid in Egypt, and explore the ancient capital of Memphis with its impressive statues and artifacts.",
    price: 65,
    duration: "Half Day",
    image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800",
    category: "Historical",
    rating: 4.7,
    featured: true,
    highlights: [
      "Step Pyramid of Djoser",
      "Ancient Memphis",
      "Alabaster Sphinx",
      "Statue of Ramses II"
    ],
    included: [
      "Expert guide",
      "Transportation",
      "Entrance fees",
      "Bottled water",
      "Hotel transfers"
    ],
    itinerary: [
      { day: 1, description: "Visit Saqqara to see the Step Pyramid and surrounding complex. Continue to Memphis to see the colossal statue of Ramses II and other monuments. Return to Cairo." }
    ]
  },
  {
    title: "Sound & Light Show at Pyramids",
    description: "Experience the magic of the pyramids at night with this spectacular Sound and Light Show. Watch as the monuments are illuminated while narration brings ancient Egyptian history to life.",
    price: 55,
    duration: "Evening",
    image: "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=800",
    category: "Entertainment",
    rating: 4.5,
    highlights: [
      "Pyramids illuminated at night",
      "Professional narration",
      "Historical storytelling",
      "Sphinx viewpoint"
    ],
    included: [
      "Show ticket",
      "Hotel transfers",
      "English guide"
    ],
    itinerary: [
      { day: 1, description: "Evening pickup from hotel. Watch the one-hour Sound and Light Show at the Giza Pyramids. Return to hotel." }
    ]
  },
  {
    title: "Desert Safari & Bedouin Dinner",
    description: "Escape the city for an authentic desert experience. Ride camels, watch the sunset, and enjoy a traditional Bedouin dinner under the stars with cultural entertainment.",
    price: 85,
    duration: "Evening",
    image: "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=800",
    category: "Adventure",
    rating: 4.8,
    highlights: [
      "Camel riding in the desert",
      "Sunset viewing",
      "Traditional Bedouin dinner",
      "Cultural show",
      "Stargazing"
    ],
    included: [
      "4x4 transportation",
      "Camel ride",
      "Bedouin dinner",
      "Entertainment",
      "Tea and water"
    ],
    itinerary: [
      { day: 1, description: "Late afternoon pickup. Drive to the desert for camel riding and sunset viewing. Enjoy a traditional Bedouin dinner with entertainment. Stargazing before return to hotel." }
    ]
  }
];

async function seedDatabase() {
  try {
    await Tour.deleteMany({});
    await Tour.insertMany(sampleTours);
    console.log('Database seeded successfully with sample tours!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
