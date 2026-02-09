import React, { useState } from 'react';

const EgyptianFood = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const foodItems = [
    {
      id: 1,
      name: 'Koshari',
      category: 'main',
      description: 'A beloved Egyptian street food made with rice, lentils, pasta, and topped with tomato sauce and fried onions',
      price: '2-4 EGP',
      where: 'Street vendors, casual restaurants',
      must_try: true
    },
    {
      id: 2,
      name: 'Ful Medames',
      category: 'breakfast',
      description: 'Slow-cooked fava beans seasoned with garlic, lemon, and olive oil. A staple breakfast dish',
      price: '1-2 EGP',
      where: 'Breakfast restaurants, street vendors',
      must_try: true
    },
    {
      id: 3,
      name: 'Falafel',
      category: 'appetizer',
      description: 'Crispy fried patties made from chickpeas or fava beans, served with tahini sauce',
      price: '1-3 EGP',
      where: 'Sandwich shops, street vendors',
      must_try: true
    },
    {
      id: 4,
      name: 'Kofta',
      category: 'main',
      description: 'Grilled ground meat mixed with herbs and spices, often served with flatbread',
      price: '15-30 EGP',
      where: 'Grillhouses, restaurants',
      must_try: true
    },
    {
      id: 5,
      name: 'Molokhia',
      category: 'main',
      description: 'A traditional soup made from leafy greens, garlic, and served over rice or with bread',
      price: '10-20 EGP',
      where: 'Home cooking, traditional restaurants',
      must_try: true
    },
    {
      id: 6,
      name: 'Basbousa',
      category: 'dessert',
      description: 'Sweet coconut or semolina cake soaked in simple syrup and topped with a pine nut',
      price: '2-5 EGP',
      where: 'Bakeries, sweet shops',
      must_try: true
    },
    {
      id: 7,
      name: 'Konafa',
      category: 'dessert',
      description: 'Shredded pastry filled with nuts or cream, baked until golden and drizzled with syrup',
      price: '3-8 EGP',
      where: 'Bakeries, dessert shops',
      must_try: true
    },
    {
      id: 8,
      name: 'Ta\'ameya',
      category: 'appetizer',
      description: 'Egyptian version of falafel made from fava beans instead of chickpeas',
      price: '1-3 EGP',
      where: 'Street vendors, sandwich shops',
      must_try: true
    },
  ];

  const categories = [
    { value: 'all', label: 'All Foods' },
    { value: 'breakfast', label: '🌅 Breakfast' },
    { value: 'appetizer', label: '🍽️ Appetizers' },
    { value: 'main', label: '🍖 Main Dishes' },
    { value: 'dessert', label: '🍰 Desserts' }
  ];

  const filteredFoods = selectedCategory === 'all' 
    ? foodItems 
    : foodItems.filter(item => item.category === selectedCategory);

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>🍽️ Egyptian Cuisine Guide</h1>
      <p>Discover authentic Egyptian foods that will tantalize your taste buds</p>

      <div style={{ marginBottom: '30px' }}>
        <h3>Filter by Category:</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              style={{
                padding: '10px 20px',
                borderRadius: '5px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: selectedCategory === cat.value ? '#007bff' : '#e0e0e0',
                color: selectedCategory === cat.value ? 'white' : 'black',
                fontSize: '14px'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {filteredFoods.map(food => (
          <div key={food.id} style={{
            backgroundColor: '#f5f5f5',
            padding: '20px',
            borderRadius: '10px',
            border: food.must_try ? '2px solid #ffc107' : 'none'
          }}>
            {food.must_try && <div style={{ color: '#ffc107', marginBottom: '10px' }}>⭐ MUST TRY</div>}
            <h3>{food.name}</h3>
            <p>{food.description}</p>
            <div style={{ marginTop: '15px', fontSize: '14px' }}>
              <p><strong>Price Range:</strong> {food.price}</p>
              <p><strong>Where to Find:</strong> {food.where}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: '#f0f8ff', padding: '20px', borderRadius: '5px' }}>
        <h2>Egyptian Dining Tips</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          <div>
            <h3>🕐 Meal Times</h3>
            <p>Breakfast is early and hearty. Lunch (around 2-3 PM) is the main meal. Dinner is lighter and later (8-10 PM)</p>
          </div>
          <div>
            <h3>💵 Haggling</h3>
            <p>At street vendors and bazaars, gentle haggling is expected and part of the experience</p>
          </div>
          <div>
            <h3>🧑‍🍳 Street Food</h3>
            <p>Egyptian street food is delicious and safe. Look for busy vendors with high turnover</p>
          </div>
          <div>
            <h3>🥤 Beverages</h3>
            <p>Try fresh sugarcane juice, hibiscus tea, and Egyptian coffee. Use bottled water</p>
          </div>
          <div>
            <h3>🌶️ Spice Level</h3>
            <p>Egyptian food can be spicy. Ask the vendor "not spicy" if you can't handle heat</p>
          </div>
          <div>
            <h3>🙏 Respect</h3>
            <p>During Ramadan, eating in public during fasting hours is not appropriate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EgyptianFood;