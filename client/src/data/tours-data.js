// ============================================
// TOURS DATA FILE
// ============================================
// This file contains all tour information for the website.
//
// HOW TO EDIT TOURS:
// 1. To change existing tour details, simply edit the values below
// 2. To add a new tour, copy an existing tour object and paste it at the end
// 3. Make sure to give it a unique 'id' number
// 4. Change the details (name, prices, duration, description, etc.)
//
// TOUR OBJECT STRUCTURE:
// - id: Unique number for the tour (1, 2, 3, etc.)
// - name: Tour name/title
// - prices: Price categories object with keys: individual, group, sharing
// - duration: How long the tour takes (e.g., '4 hours' or '3 days')
// - description: Detailed description of the tour
// - image: Emoji icon
// - rating: Star rating out of 5 (e.g., 4.9)
// - reviews: Number of reviews
// - groupSize: Size of tour group (e.g., '2-10 people')
// - itinerary: Array of steps; each step has: day (number), time (string), title (string), description (string)
//   For single-day tours set day to 1. For multi-day tours use day 1, 2, 3, etc. to group steps.

export const tours = [
  {
    "id": 1,
    "name": "Pyramids of Giza",
    "prices": {
      "individual": "$225",
      "group": "$175",
      "sharing": "$99"
    },
    "duration": "4 hours",
    "description": "Stand in awe of the world's last remaining wonder. Explore the Great Pyramid, Khafre's Pyramid, and the enigmatic Sphinx.",
    "image": "🏛️",
    "photoUrl": "https://images.unsplash.com/photo-1539650116574-75c0c6d27b35?auto=format&fit=crop&w=800&q=80",
    "rating": 4.9,
    "reviews": 324,
    "groupSize": "2-10 people",
    "itinerary": [
      { "day": 1, "time": "8:00 AM", "title": "Hotel Pickup", "description": "Your air-conditioned vehicle picks you up from your Cairo or Giza hotel." },
      { "day": 1, "time": "9:00 AM", "title": "Great Pyramid of Khufu", "description": "Begin with the largest of the three pyramids. Optional interior visit available (additional fee)." },
      { "day": 1, "time": "10:00 AM", "title": "Pyramid of Khafre & Menkaure", "description": "Explore the second and third pyramids with panoramic views of the entire Giza plateau." },
      { "day": 1, "time": "11:00 AM", "title": "The Great Sphinx", "description": "Stand before the legendary half-lion, half-human guardian and learn about its ancient mysteries." },
      { "day": 1, "time": "11:45 AM", "title": "Solar Boat Museum", "description": "Discover the 4,500-year-old royal barge reconstructed from 1,224 cedar planks." },
      { "day": 1, "time": "12:00 PM", "title": "Hotel Drop-off", "description": "Return transfer to your hotel. Bottled water and refreshments provided throughout." }
    ]
  },
  {
    "id": 2,
    "name": "Luxor Temple",
    "prices": {
      "individual": "$159",
      "group": "$125",
      "sharing": "$69"
    },
    "duration": "3 hours",
    "description": "Discover the magnificent Luxor Temple on the banks of the Nile River with stunning hieroglyphic carvings.",
    "image": "🕌",
    "photoUrl": "https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=800&q=80",
    "rating": 4.8,
    "reviews": 287,
    "groupSize": "2-12 people",
    "itinerary": [
      { "day": 1, "time": "3:00 PM", "title": "Hotel Pickup", "description": "Transfer from your Luxor hotel to the temple entrance on the Corniche." },
      { "day": 1, "time": "3:30 PM", "title": "Avenue of Sphinxes", "description": "Walk the recently uncovered 3 km sphinx-lined avenue connecting Luxor and Karnak Temples." },
      { "day": 1, "time": "4:00 PM", "title": "Great Pylon of Ramesses II", "description": "Admire the towering gateway decorated with battle scenes and the two colossal seated statues." },
      { "day": 1, "time": "4:30 PM", "title": "Colonnade of Amenhotep III", "description": "Pass through 14 massive papyrus-capital columns built for the Opet Festival procession." },
      { "day": 1, "time": "5:00 PM", "title": "Inner Sanctuaries", "description": "Explore the birth chamber, Alexander the Great's shrine, and the Roman legionary camp ruins within the temple." },
      { "day": 1, "time": "6:00 PM", "title": "Hotel Drop-off", "description": "Return to your hotel. The temple is beautifully illuminated at dusk." }
    ]
  },
  {
    "id": 3,
    "name": "Valley of the Kings",
    "prices": {
      "individual": "$179",
      "group": "$139",
      "sharing": "$79"
    },
    "duration": "5 hours",
    "description": "Explore the royal tombs of ancient pharaohs in the mystical Valley of the Kings with expert Egyptologist guides.",
    "image": "⚱️",
    "photoUrl": "https://images.unsplash.com/photo-1588492069485-d05b56b2831d?auto=format&fit=crop&w=800&q=80",
    "rating": 4.95,
    "reviews": 412,
    "groupSize": "2-10 people",
    "itinerary": [
      { "day": 1, "time": "6:00 AM", "title": "Early Morning Pickup", "description": "Beat the heat with an early hotel pickup from Luxor." },
      { "day": 1, "time": "6:45 AM", "title": "Colossi of Memnon", "description": "Brief stop at the two massive stone statues that once guarded the entrance to Amenhotep III's mortuary temple." },
      { "day": 1, "time": "7:15 AM", "title": "Valley of the Kings Entry", "description": "Enter the royal necropolis containing over 60 tombs. Your ticket includes access to three tombs." },
      { "day": 1, "time": "7:30 AM", "title": "Tomb Exploration", "description": "Descend into vividly painted royal tombs with your Egyptologist guide explaining each scene's meaning." },
      { "day": 1, "time": "9:00 AM", "title": "Temple of Hatshepsut", "description": "Visit the three-tiered mortuary temple of Egypt's most successful female pharaoh." },
      { "day": 1, "time": "10:30 AM", "title": "Craftsmen's Village – Deir el-Medina", "description": "Optional stop at the village where the tomb workers lived, with beautifully painted tombs of commoners." },
      { "day": 1, "time": "11:00 AM", "title": "Hotel Drop-off", "description": "Return transfer to your Luxor hotel." }
    ]
  },
  {
    "id": 4,
    "name": "Nile River Cruise",
    "prices": {
      "individual": "$249",
      "group": "$199",
      "sharing": "$99"
    },
    "duration": "3-7 hours",
    "description": "Experience a luxurious sunset or evening cruise along the iconic Nile River with traditional music and cuisine.",
    "image": "🚤",
    "photoUrl": "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?auto=format&fit=crop&w=800&q=80",
    "rating": 4.7,
    "reviews": 356,
    "groupSize": "2-50 people",
    "itinerary": [
      { "day": 1, "time": "5:30 PM", "title": "Hotel Pickup", "description": "Transfer from your Cairo or Luxor hotel to the private cruise dock." },
      { "day": 1, "time": "6:00 PM", "title": "Welcome Aboard", "description": "Board your felucca or dahabiya, meet your crew, and enjoy welcome drinks as you settle in." },
      { "day": 1, "time": "6:15 PM", "title": "Sunset Sailing", "description": "Set sail along the Nile as the sun dips below the horizon, painting the river gold." },
      { "day": 1, "time": "7:00 PM", "title": "Live Entertainment", "description": "Enjoy traditional Egyptian music with oud and tabla players and an optional belly dancing performance." },
      { "day": 1, "time": "7:30 PM", "title": "Egyptian Dinner", "description": "Savor a freshly prepared three-course Egyptian dinner with mezze, grilled meats, and seasonal vegetables." },
      { "day": 1, "time": "9:00 PM", "title": "Return to Dock", "description": "Arrive back at the dock. Transfer to your hotel included." }
    ]
  },
  {
    "id": 5,
    "name": "Cairo Museum",
    "prices": {
      "individual": "$89",
      "group": "$69",
      "sharing": "$39"
    },
    "duration": "3 hours",
    "description": "Immerse yourself in Egyptian history at the world-renowned Cairo Museum housing treasures of Tutankhamun.",
    "image": "🏺",
    "photoUrl": "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?auto=format&fit=crop&w=800&q=80",
    "rating": 4.8,
    "reviews": 521,
    "groupSize": "1-15 people",
    "itinerary": [
      { "day": 1, "time": "9:00 AM", "title": "Hotel Pickup", "description": "Transfer from your Cairo hotel to Tahrir Square." },
      { "day": 1, "time": "9:30 AM", "title": "Ground Floor Highlights", "description": "Walk through the royal mummy hall, ancient statues, and the famous Narmer Palette with your guide." },
      { "day": 1, "time": "10:15 AM", "title": "Tutankhamun Galleries", "description": "Marvel at over 5,000 artifacts from the boy king's intact tomb including the iconic golden mask." },
      { "day": 1, "time": "11:00 AM", "title": "Akhenaten Room & Amarna Period", "description": "Explore the revolutionary art of Egypt's monotheistic pharaoh and his beautiful queen Nefertiti." },
      { "day": 1, "time": "11:30 AM", "title": "Mummies Hall (Optional)", "description": "View the preserved royal mummies of Ramesses II, Seti I, and other pharaohs (extra ticket required)." },
      { "day": 1, "time": "12:00 PM", "title": "Hotel Drop-off", "description": "Return transfer to your hotel. Free time for souvenir shopping at the museum gift shop." }
    ]
  },
  {
    "id": 6,
    "name": "Abu Simbel Temples",
    "prices": {
      "individual": "$299",
      "group": "$239",
      "sharing": "$129"
    },
    "duration": "8-10 hours",
    "description": "Visit the spectacular Abu Simbel temples carved into the mountainside with breathtaking colossal statues.",
    "image": "🗿",
    "photoUrl": "https://images.unsplash.com/photo-1590418606746-018840f9cd0f?auto=format&fit=crop&w=800&q=80",
    "rating": 4.85,
    "reviews": 189,
    "groupSize": "2-15 people",
    "itinerary": [
      { "day": 1, "time": "3:30 AM", "title": "Pre-Dawn Hotel Pickup", "description": "Early departure from your Aswan hotel for the 3-hour drive south along Lake Nasser." },
      { "day": 1, "time": "6:30 AM", "title": "Arrival at Abu Simbel", "description": "Arrive as the sun rises over Lake Nasser, creating a magical atmosphere around the temples." },
      { "day": 1, "time": "7:00 AM", "title": "Great Temple of Ramesses II", "description": "Enter the massive rock-cut temple guarded by four 20-meter seated colossi. Explore inner halls decorated with vivid battle reliefs." },
      { "day": 1, "time": "8:30 AM", "title": "Temple of Nefertari", "description": "Visit the adjacent temple dedicated to Ramesses II's beloved queen and the goddess Hathor." },
      { "day": 1, "time": "9:15 AM", "title": "Relocation Exhibition", "description": "Learn how UNESCO moved both temples 65 meters uphill to save them from Lake Nasser's rising waters." },
      { "day": 1, "time": "10:00 AM", "title": "Departure", "description": "Begin the return drive to Aswan with a rest stop along the way." },
      { "day": 1, "time": "1:00 PM", "title": "Hotel Drop-off", "description": "Arrive back in Aswan. Lunch box and bottled water provided." }
    ]
  },
  {
    "id": 7,
    "name": "Aswan & Philae Temple",
    "prices": {
      "individual": "$195",
      "group": "$155",
      "sharing": "$85"
    },
    "duration": "6 hours",
    "description": "Cruise across the tranquil Nile to the stunning Philae Temple, dedicated to the goddess Isis, set on a lush island.",
    "image": "⛵",
    "photoUrl": "https://images.unsplash.com/photo-1553697388-94e804e2f0f6?auto=format&fit=crop&w=800&q=80",
    "rating": 4.8,
    "reviews": 214,
    "groupSize": "2-12 people",
    "itinerary": [
      { "day": 1, "time": "8:00 AM", "title": "Hotel Pickup", "description": "Comfortable transfer from your Aswan hotel." },
      { "day": 1, "time": "8:30 AM", "title": "High Dam Viewpoint", "description": "Stop at Aswan's remarkable High Dam for a panoramic overview." },
      { "day": 1, "time": "9:15 AM", "title": "Unfinished Obelisk", "description": "See the ancient granite obelisk abandoned in its quarry, giving insight into how these monuments were carved." },
      { "day": 1, "time": "10:00 AM", "title": "Motorboat to Philae Island", "description": "Board a small motorboat to reach the island of Agilkia where Philae Temple was relocated." },
      { "day": 1, "time": "10:15 AM", "title": "Temple of Isis – Philae", "description": "Explore the romantic island temple complex dedicated to the goddess Isis with your Egyptologist guide." },
      { "day": 1, "time": "12:00 PM", "title": "Nubian Village Visit", "description": "Optional stop at a colorful Nubian village for tea and a glimpse of traditional life along the Nile." },
      { "day": 1, "time": "1:30 PM", "title": "Hotel Drop-off", "description": "Return transfer to your Aswan hotel." }
    ]
  },
  {
    "id": 8,
    "name": "Saqqara & Memphis",
    "prices": {
      "individual": "$135",
      "group": "$105",
      "sharing": "$59"
    },
    "duration": "5 hours",
    "description": "Explore Egypt's oldest capital and the iconic Step Pyramid of Djoser – the world's first large-scale stone structure.",
    "image": "🏜️",
    "photoUrl": "https://images.unsplash.com/photo-1612833609709-5d1a47857867?auto=format&fit=crop&w=800&q=80",
    "rating": 4.75,
    "reviews": 163,
    "groupSize": "2-10 people",
    "itinerary": [
      { "day": 1, "time": "8:00 AM", "title": "Hotel Pickup", "description": "Depart from your Cairo hotel heading south along the Nile." },
      { "day": 1, "time": "9:00 AM", "title": "Memphis Open-Air Museum", "description": "Visit ancient Egypt's first capital with the colossal fallen statue of Ramesses II and the alabaster sphinx." },
      { "day": 1, "time": "10:00 AM", "title": "Step Pyramid of Djoser", "description": "Stand before the world's oldest monumental stone structure, designed by Imhotep around 2650 BC." },
      { "day": 1, "time": "10:45 AM", "title": "Mortuary Complex", "description": "Explore the vast funerary complex surrounding the pyramid including the Heb-Sed court and underground galleries." },
      { "day": 1, "time": "11:30 AM", "title": "Mastaba Tombs", "description": "Descend into Old Kingdom private tombs decorated with detailed scenes of daily life in ancient Egypt." },
      { "day": 1, "time": "12:30 PM", "title": "Hotel Drop-off", "description": "Return to Cairo. Refreshments provided throughout." }
    ]
  },
  {
    "id": 9,
    "name": "Egyptian Cooking Class",
    "prices": {
      "individual": "$79",
      "group": "$59",
      "sharing": "$35"
    },
    "duration": "3 hours",
    "description": "Learn to prepare authentic Egyptian dishes like koshary, ful medames, and basbousa with a local chef in Cairo.",
    "image": "🍲",
    "photoUrl": "https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&fit=crop&w=800&q=80",
    "rating": 4.9,
    "reviews": 302,
    "groupSize": "2-8 people",
    "itinerary": [
      { "day": 1, "time": "10:00 AM", "title": "Welcome & Apron Up", "description": "Arrive at our Cairo kitchen, meet Chef Hassan, and hear about the history of Egyptian cuisine." },
      { "day": 1, "time": "10:15 AM", "title": "Market Ingredients Overview", "description": "Learn about the fresh spices, herbs, and produce used in Egyptian cooking." },
      { "day": 1, "time": "10:30 AM", "title": "Prepare Koshary", "description": "Egypt's beloved street food – a hearty mix of rice, lentils, pasta, and crispy onions with tangy tomato sauce." },
      { "day": 1, "time": "11:00 AM", "title": "Cook Ful Medames & Ta'ameya", "description": "Make the classic Egyptian breakfast of slow-cooked fava beans and crispy falafel from scratch." },
      { "day": 1, "time": "11:30 AM", "title": "Basbousa Dessert", "description": "Prepare the semolina cake soaked in rose-water syrup – a staple of Egyptian sweets." },
      { "day": 1, "time": "12:00 PM", "title": "Sit Down & Feast", "description": "Enjoy everything you cooked with Egyptian tea and take home the recipes." }
    ]
  },
  {
    "id": 10,
    "name": "White Desert Safari",
    "prices": {
      "individual": "$349",
      "group": "$279",
      "sharing": "$149"
    },
    "duration": "2 days",
    "description": "Camp under the stars amidst the surreal white chalk rock formations of the Sahara in the Western Desert.",
    "image": "🌵",
    "photoUrl": "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=800&q=80",
    "rating": 4.95,
    "reviews": 127,
    "groupSize": "4-12 people",
    "itinerary": [
      { "day": 1, "time": "7:00 AM", "title": "Cairo Departure", "description": "Depart Cairo in a 4x4 vehicle heading west to the Bahariya Oasis (4-hour drive)." },
      { "day": 1, "time": "11:00 AM", "title": "Bahariya Oasis Exploration", "description": "Explore the Black Desert, Crystal Mountain, and the Valley of the Golden Mummies near the oasis." },
      { "day": 1, "time": "2:00 PM", "title": "Enter the White Desert", "description": "Drive into the White Desert National Park and witness the surreal chalk rock formations shaped like mushrooms and icebergs." },
      { "day": 1, "time": "6:00 PM", "title": "Desert Camp & Sunset", "description": "Set up Bedouin-style tents among the white formations. Watch the sun paint the chalk in shades of pink and gold." },
      { "day": 1, "time": "8:00 PM", "title": "Campfire Dinner & Stargazing", "description": "Traditional Bedouin dinner around the campfire under a sky full of stars far from city lights." },
      { "day": 2, "time": "6:00 AM", "title": "Sunrise in the Desert", "description": "Wake up to watch the golden sunrise transform the white formations into hues of pink and orange." },
      { "day": 2, "time": "8:00 AM", "title": "Bedouin Breakfast", "description": "Enjoy a traditional Bedouin breakfast of eggs, flatbread, honey, and fresh tea prepared over the campfire." },
      { "day": 2, "time": "9:00 AM", "title": "Final Exploration & Photography", "description": "Photograph the most iconic rock formations in the soft morning light before the heat rises." },
      { "day": 2, "time": "11:00 AM", "title": "Departure from Desert", "description": "Begin the 4-hour drive back to Cairo with a rest stop at Bahariya." },
      { "day": 2, "time": "4:00 PM", "title": "Return to Cairo", "description": "Arrive back in Cairo in the late afternoon. Drop-off at your hotel." }
    ]
  },
  {
    "id": 11,
    "name": "Alexandria Day Trip",
    "prices": {
      "individual": "$149",
      "group": "$119",
      "sharing": "$65"
    },
    "duration": "Full day",
    "description": "Discover Cleopatra's city – the Catacombs of Kom El Shoqafa, Pompey's Pillar, and the stunning Library of Alexandria.",
    "image": "🏛️",
    "photoUrl": "https://images.unsplash.com/photo-1557456170-0cf4f4d0d362?auto=format&fit=crop&w=800&q=80",
    "rating": 4.7,
    "reviews": 248,
    "groupSize": "2-15 people",
    "itinerary": [
      { "day": 1, "time": "7:00 AM", "title": "Cairo Departure", "description": "Depart Cairo by air-conditioned vehicle on the 2.5-hour drive to Alexandria along the desert highway." },
      { "day": 1, "time": "9:30 AM", "title": "Catacombs of Kom El Shoqafa", "description": "Descend into the largest known Roman funerary complex in Egypt, blending Greek, Roman, and Egyptian decorative styles." },
      { "day": 1, "time": "10:30 AM", "title": "Pompey's Pillar", "description": "See the towering 27-meter granite column set amid the ruins of the ancient Serapeum." },
      { "day": 1, "time": "11:30 AM", "title": "Bibliotheca Alexandrina", "description": "Visit the iconic modern library built on the site of the ancient Library of Alexandria, with fascinating museums inside." },
      { "day": 1, "time": "1:00 PM", "title": "Seafood Lunch", "description": "Enjoy a fresh Mediterranean seafood lunch at a restaurant overlooking the Eastern Harbor." },
      { "day": 1, "time": "2:30 PM", "title": "Qaitbay Citadel", "description": "Explore the 15th-century sea fortress built on the site of the ancient Lighthouse of Alexandria – one of the Seven Wonders." },
      { "day": 1, "time": "4:00 PM", "title": "Return to Cairo", "description": "Depart Alexandria arriving back in Cairo by early evening." }
    ]
  },
  {
    "id": 12,
    "name": "Hot Air Balloon – Luxor",
    "prices": {
      "individual": "$189",
      "group": "$159",
      "sharing": "$89"
    },
    "duration": "1 hour",
    "description": "Drift silently over the temples and tombs of ancient Thebes at sunrise for an unforgettable bird's-eye view of Luxor.",
    "image": "🎈",
    "photoUrl": "https://images.unsplash.com/photo-1543167076-07b6e4f7b7b2?auto=format&fit=crop&w=800&q=80",
    "rating": 4.95,
    "reviews": 431,
    "groupSize": "2-16 people",
    "itinerary": [
      { "day": 1, "time": "4:30 AM", "title": "Pre-Dawn Hotel Pickup", "description": "Early transfer from your Luxor hotel to the West Bank launch site." },
      { "day": 1, "time": "5:00 AM", "title": "Balloon Inflation", "description": "Watch the spectacular inflation of the giant balloon by your experienced crew as the sky begins to lighten." },
      { "day": 1, "time": "5:30 AM", "title": "Lift Off at Sunrise", "description": "Rise silently into the sky just as the sun appears over the Eastern horizon, flooding Luxor with golden light." },
      { "day": 1, "time": "5:45 AM", "title": "Aerial Views of Ancient Thebes", "description": "Float over the Valley of the Kings, Hatshepsut's Temple, Karnak, and the Nile with your pilot narrating below." },
      { "day": 1, "time": "6:15 AM", "title": "Landing & Celebration", "description": "Gentle touchdown in the West Bank farmland. Traditional champagne ceremony with the crew." },
      { "day": 1, "time": "6:45 AM", "title": "Hotel Drop-off", "description": "Return to your Luxor hotel in time for breakfast." }
    ]
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
