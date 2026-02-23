// ============================================
// TOURS DATA FILE
// ============================================
// This file contains all tour information for the website.
// 
// HOW TO EDIT TOURS:
// 1. To change existing tour details, simply edit the values below
// 2. To add a new tour, copy an existing tour object and paste it at the end
// 3. Make sure to give it a unique 'id' number
// 4. Change the details (name, price, duration, description, etc.)
// 
// TOUR OBJECT STRUCTURE:
// - id: Unique number for the tour (1, 2, 3, etc.)
// - name: Tour name/title
// - price: Price with $ symbol (e.g., '$199')
// - duration: How long the tour takes (e.g., '4 hours')
// - description: Detailed description of the tour
// - image: Emoji icon (copy from emojipedia.org)
// - rating: Star rating out of 5 (e.g., 4.9)
// - reviews: Number of reviews
// - groupSize: Size of tour group (e.g., '2-10 people')

export const tours = [
  {
    "id": 1,
    "name": "Pyramids of Giza",
    "price": "$225",
    "duration": "4 hours",
    "description": "Stand in awe of the world's last remaining wonder. Explore the Great Pyramid, Khafre's Pyramid, and the enigmatic Sphinx.",
    "image": "🏛️",
    "photoUrl": "https://images.unsplash.com/photo-1539650116574-75c0c6d27b35?auto=format&fit=crop&w=800&q=80",
    "rating": 4.9,
    "reviews": 324,
    "groupSize": "2-10 people"
  },
  {
    "id": 2,
    "name": "Luxor Temple",
    "price": "$159",
    "duration": "3 hours",
    "description": "Discover the magnificent Luxor Temple on the banks of the Nile River with stunning hieroglyphic carvings.",
    "image": "🕌",
    "photoUrl": "https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=800&q=80",
    "rating": 4.8,
    "reviews": 287,
    "groupSize": "2-12 people"
  },
  {
    "id": 3,
    "name": "Valley of the Kings",
    "price": "$179",
    "duration": "5 hours",
    "description": "Explore the royal tombs of ancient pharaohs in the mystical Valley of the Kings with expert Egyptologist guides.",
    "image": "⚱️",
    "photoUrl": "https://images.unsplash.com/photo-1588492069485-d05b56b2831d?auto=format&fit=crop&w=800&q=80",
    "rating": 4.95,
    "reviews": 412,
    "groupSize": "2-10 people"
  },
  {
    "id": 4,
    "name": "Nile River Cruise",
    "price": "$249",
    "duration": "3-7 hours",
    "description": "Experience a luxurious sunset or evening cruise along the iconic Nile River with traditional music and cuisine.",
    "image": "🚤",
    "photoUrl": "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?auto=format&fit=crop&w=800&q=80",
    "rating": 4.7,
    "reviews": 356,
    "groupSize": "2-50 people"
  },
  {
    "id": 5,
    "name": "Cairo Museum",
    "price": "$89",
    "duration": "3 hours",
    "description": "Immerse yourself in Egyptian history at the world-renowned Cairo Museum housing treasures of Tutankhamun.",
    "image": "🏺",
    "photoUrl": "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?auto=format&fit=crop&w=800&q=80",
    "rating": 4.8,
    "reviews": 521,
    "groupSize": "1-15 people"
  },
  {
    "id": 6,
    "name": "Abu Simbel Temples",
    "price": "$299",
    "duration": "8-10 hours",
    "description": "Visit the spectacular Abu Simbel temples carved into the mountainside with breathtaking colossal statues.",
    "image": "🗿",
    "photoUrl": "https://images.unsplash.com/photo-1590418606746-018840f9cd0f?auto=format&fit=crop&w=800&q=80",
    "rating": 4.85,
    "reviews": 189,
    "groupSize": "2-15 people"
  },
  {
    "id": 7,
    "name": "Aswan & Philae Temple",
    "price": "$195",
    "duration": "6 hours",
    "description": "Cruise across the tranquil Nile to the stunning Philae Temple, dedicated to the goddess Isis, set on a lush island.",
    "image": "⛵",
    "photoUrl": "https://images.unsplash.com/photo-1553697388-94e804e2f0f6?auto=format&fit=crop&w=800&q=80",
    "rating": 4.8,
    "reviews": 214,
    "groupSize": "2-12 people"
  },
  {
    "id": 8,
    "name": "Saqqara & Memphis",
    "price": "$135",
    "duration": "5 hours",
    "description": "Explore Egypt's oldest capital and the iconic Step Pyramid of Djoser – the world's first large-scale stone structure.",
    "image": "🏜️",
    "photoUrl": "https://images.unsplash.com/photo-1612833609709-5d1a47857867?auto=format&fit=crop&w=800&q=80",
    "rating": 4.75,
    "reviews": 163,
    "groupSize": "2-10 people"
  },
  {
    "id": 9,
    "name": "Egyptian Cooking Class",
    "price": "$79",
    "duration": "3 hours",
    "description": "Learn to prepare authentic Egyptian dishes like koshary, ful medames, and basbousa with a local chef in Cairo.",
    "image": "🍲",
    "photoUrl": "https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&fit=crop&w=800&q=80",
    "rating": 4.9,
    "reviews": 302,
    "groupSize": "2-8 people"
  },
  {
    "id": 10,
    "name": "White Desert Safari",
    "price": "$349",
    "duration": "2 days",
    "description": "Camp under the stars amidst the surreal white chalk rock formations of the Sahara in the Western Desert.",
    "image": "🌵",
    "photoUrl": "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=800&q=80",
    "rating": 4.95,
    "reviews": 127,
    "groupSize": "4-12 people"
  },
  {
    "id": 11,
    "name": "Alexandria Day Trip",
    "price": "$149",
    "duration": "Full day",
    "description": "Discover Cleopatra's city – the Catacombs of Kom El Shoqafa, Pompey's Pillar, and the stunning Library of Alexandria.",
    "image": "🏛️",
    "photoUrl": "https://images.unsplash.com/photo-1557456170-0cf4f4d0d362?auto=format&fit=crop&w=800&q=80",
    "rating": 4.7,
    "reviews": 248,
    "groupSize": "2-15 people"
  },
  {
    "id": 12,
    "name": "Hot Air Balloon – Luxor",
    "price": "$189",
    "duration": "1 hour",
    "description": "Drift silently over the temples and tombs of ancient Thebes at sunrise for an unforgettable bird's-eye view of Luxor.",
    "image": "🎈",
    "photoUrl": "https://images.unsplash.com/photo-1543167076-07b6e4f7b7b2?auto=format&fit=crop&w=800&q=80",
    "rating": 4.95,
    "reviews": 431,
    "groupSize": "2-16 people"
  }
];

// ============================================
// TESTIMONIALS DATA
// ============================================
// Customer testimonials that appear on the website

export const testimonials = [
  {
    "name": "Sarah Johnson",
    "country": "USA",
    "text": "An absolutely life-changing experience! The guides were knowledgeable and the itinerary was perfectly planned."
  },
  {
    "name": "Marco Ferrari",
    "country": "Italy",
    "text": "Egypt Advisor Tours exceeded all my expectations. The attention to detail and customer service is outstanding."
  },
  {
    "name": "Amara Khan",
    "country": "UAE",
    "text": "Best tour company in Egypt! Professional, punctual, and incredibly passionate about their work."
  }
];
