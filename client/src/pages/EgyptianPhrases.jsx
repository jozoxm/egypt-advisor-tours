import React, { useState } from 'react';

const EgyptianPhrases = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const phrases = [
    { id: 1, category: 'greetings', english: 'Hello', arabic: 'السلام عليكم', pronunciation: 'As-salamu alaykum', usage: 'Formal greeting' },
    { id: 2, category: 'greetings', english: 'Hi/Hey', arabic: 'أهلا', pronunciation: 'Ahlan', usage: 'Casual greeting' },
    { id: 3, category: 'greetings', english: 'Good morning', arabic: 'صباح الخير', pronunciation: 'Sabah al-khair', usage: 'Morning greeting' },
    { id: 4, category: 'greetings', english: 'Good evening', arabic: 'مساء الخير', pronunciation: 'Masaa al-khair', usage: 'Evening greeting' },
    
    { id: 5, category: 'politeness', english: 'Please', arabic: 'من فضلك', pronunciation: 'Min fadlak', usage: 'Request politely' },
    { id: 6, category: 'politeness', english: 'Thank you', arabic: 'شكرا', pronunciation: 'Shukran', usage: 'Express gratitude' },
    { id: 7, category: 'politeness', english: "You're welcome", arabic: 'أهلا وسهلا', pronunciation: 'Ahlan wa sahlan', usage: 'Response to thanks' },
    { id: 8, category: 'politeness', english: 'Excuse me', arabic: 'عذرا', pronunciation: 'Aafwan', usage: 'Get attention' },
    
    { id: 9, category: 'numbers', english: 'One', arabic: 'واحد', pronunciation: 'Wahid', usage: 'Number 1' },
    { id: 10, category: 'numbers', english: 'Two', arabic: 'اثنين', pronunciation: 'Ithnin', usage: 'Number 2' },
    { id: 11, category: 'numbers', english: 'Three', arabic: 'ثلاثة', pronunciation: 'Talata', usage: 'Number 3' },
    { id: 12, category: 'numbers', english: 'Ten', arabic: 'عشرة', pronunciation: 'Ashara', usage: 'Number 10' },
    
    { id: 13, category: 'travel', english: 'Where is the bathroom?', arabic: 'أين الحمام؟', pronunciation: 'Ayn al-hammam?', usage: 'Essential travel phrase' },
    { id: 14, category: 'travel', english: 'How much does this cost?', arabic: 'كم السعر؟', pronunciation: 'Kam al-si\'r?', usage: 'Shopping/bargaining' },
    { id: 15, category: 'travel', english: "I don't understand", arabic: 'لا أفهم', pronunciation: 'La afhum', usage: 'Communication' },
    { id: 16, category: 'travel', english: 'Do you speak English?', arabic: 'هل تتحدث الإنجليزية؟', pronunciation: 'Hal tatahaddath al-Ingiliziyya?', usage: 'Language assistance' },
    
    { id: 17, category: 'food', english: 'What do you recommend?', arabic: 'ماذا تنصحني؟', pronunciation: 'Madha tansahni?', usage: 'Ordering food' },
    { id: 18, category: 'food', english: 'The food is delicious', arabic: 'الأكل لذيذ جدا', pronunciation: 'Al-akal ladhidh jiddan', usage: 'Compliment food' },
    { id: 19, category: 'food', english: 'No spicy please', arabic: 'بدون فلفل حار من فضلك', pronunciation: 'Bidun filfil harr min fadlak', usage: 'Food preference' },
    { id: 20, category: 'food', english: 'The bill please', arabic: 'الحساب من فضلك', pronunciation: 'Al-hisab min fadlak', usage: 'Requesting check' },
  ];

  const categories = [
    { value: 'all', label: 'All Phrases' },
    { value: 'greetings', label: 'Greetings' },
    { value: 'politeness', label: 'Politeness' },
    { value: 'numbers', label: 'Numbers' },
    { value: 'travel', label: 'Travel & Tourism' },
    { value: 'food', label: 'Food & Dining' },
  ];

  const filteredPhrases = phrases.filter(phrase => {
    const matchesSearch = phrase.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          phrase.pronunciation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || phrase.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Egyptian Arabic Phrases & Slang</h1>
      <p>Learn essential Egyptian Arabic words and phrases to enhance your travel experience</p>

      <div style={{ marginBottom: '30px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Search phrases..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            flex: 1
          }}
        />
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ccc'
          }}
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      <div>
        {filteredPhrases.length > 0 ? (
          filteredPhrases.map(phrase => (
            <div key={phrase.id} style={{
              backgroundColor: '#f5f5f5',
              padding: '15px',
              marginBottom: '15px',
              borderRadius: '5px',
              borderLeft: '4px solid #007bff'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ margin: 0 }}>{phrase.english}</h3>
                <span style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  padding: '5px 10px',
                  borderRadius: '20px',
                  fontSize: '12px'
                }}>
                  {phrase.category}
                </span>
              </div>
              <p><strong>Arabic:</strong> {phrase.arabic}</p>
              <p><strong>How to say:</strong> {phrase.pronunciation}</p>
              <p><strong>Usage:</strong> {phrase.usage}</p>
            </div>
          ))
        ) : (
          <p>No phrases found matching your search.</p>
        )}
      </div>

      <div style={{ marginTop: '40px', backgroundColor: '#f0f8ff', padding: '20px', borderRadius: '5px' }}>
        <h2>Tips for Learning Arabic</h2>
        <ul>
          <li>🎧 Practice pronunciation by listening to native speakers</li>
          <li>📝 Write down phrases you want to remember</li>
          <li>🗣️ Don't be afraid to speak - Egyptians appreciate the effort</li>
          <li>😊 Egyptians are friendly and patient with language learners</li>
          <li>🎯 Focus on phrases most relevant to your interests and travel plans</li>
        </ul>
      </div>
    </div>
  );
};

export default EgyptianPhrases;