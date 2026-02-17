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
    id: 1,
    name: 'Pyramids of Giza',
    price: '$199',
    duration: '4 hours',
    description: 'Stand in awe of the world\'s last remaining wonder. Explore the Great Pyramid, Khafre\'s Pyramid, and the enigmatic Sphinx.',
    image: '🏛️',
    rating: 4.9,
    reviews: 324,
    groupSize: '2-10 people'
  },
  {
    id: 2,
    name: 'Luxor Temple',
    price: '$159',
    duration: '3 hours',
    description: 'Discover the magnificent Luxor Temple on the banks of the Nile River with stunning hieroglyphic carvings.',
    image: '🕌',
    rating: 4.8,
    reviews: 287,
    groupSize: '2-12 people'
  },
  {
    id: 3,
    name: 'Valley of the Kings',
    price: '$179',
    duration: '5 hours',
    description: 'Explore the royal tombs of ancient pharaohs in the mystical Valley of the Kings with expert Egyptologist guides.',
    image: '⚱️',
    rating: 4.95,
    reviews: 412,
    groupSize: '2-10 people'
  },
  {
    id: 4,
    name: 'Nile River Cruise',
    price: '$249',
    duration: '3-7 hours',
    description: 'Experience a luxurious sunset or evening cruise along the iconic Nile River with traditional music and cuisine.',
    image: '🚤',
    rating: 4.7,
    reviews: 356,
    groupSize: '2-50 people'
  },
  {
    id: 5,
    name: 'Cairo Museum',
    price: '$89',
    duration: '3 hours',
    description: 'Immerse yourself in Egyptian history at the world-renowned Cairo Museum housing treasures of Tutankhamun.',
    image: '🏺',
    rating: 4.8,
    reviews: 521,
    groupSize: '1-15 people'
  },
  {
    id: 6,
    name: 'Abu Simbel Temples',
    price: '$299',
    duration: '8-10 hours',
    description: 'Visit the spectacular Abu Simbel temples carved into the mountainside with breathtaking colossal statues.',
    image: '🗿',
    rating: 4.85,
    reviews: 189,
    groupSize: '2-15 people'
  }
];

// ============================================
// TESTIMONIALS DATA
// ============================================
// Customer testimonials that appear on the website

export const testimonials = [
  {
    name: 'Sarah Johnson',
    country: 'USA',
    text: 'An absolutely life-changing experience! The guides were knowledgeable and the itinerary was perfectly planned.'
  },
  {
    name: 'Marco Ferrari',
    country: 'Italy',
    text: 'Egypt Advisor Tours exceeded all my expectations. The attention to detail and customer service is outstanding.'
  },
  {
    name: 'Amara Khan',
    country: 'UAE',
    text: 'Best tour company in Egypt! Professional, punctual, and incredibly passionate about their work.'
  }
];
