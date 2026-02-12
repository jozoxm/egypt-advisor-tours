import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Tours.css';

const Tours = () => {
    const navigate = useNavigate();
    
    // Sample tour data - in a real app this would come from an API
    const allTours = [
        {
            id: 1,
            name: 'Pyramids of Giza Tour',
            description: 'Explore the iconic pyramids and the Great Sphinx, one of the Seven Wonders of the Ancient World. Includes expert guide and transportation.',
            price: 89,
            duration: '4 hours',
            groupSize: 'Up to 15',
            icon: '🏛️',
            featured: true
        },
        {
            id: 2,
            name: 'Nile River Cruise',
            description: 'Sail along the legendary Nile River and discover ancient temples and historic landmarks. 3-day luxury cruise with all meals included.',
            price: 299,
            duration: '3 days',
            groupSize: 'Up to 50',
            icon: '🚢',
            featured: true
        },
        {
            id: 3,
            name: 'Luxor & Valley of Kings',
            description: 'Visit the magnificent temples of Luxor and explore the tombs in the Valley of the Kings. Full-day tour with lunch.',
            price: 199,
            duration: '8 hours',
            groupSize: 'Up to 20',
            icon: '⛰️',
            featured: false
        },
        {
            id: 4,
            name: 'Egyptian Museum Tour',
            description: 'Discover the treasures of ancient Egypt including King Tutankhamun\'s golden mask and mummies of great pharaohs.',
            price: 65,
            duration: '3 hours',
            groupSize: 'Up to 25',
            icon: '🏺',
            featured: false
        },
        {
            id: 5,
            name: 'Alexandria Day Trip',
            description: 'Explore the Mediterranean coastal city of Alexandria, visiting the Library, Citadel of Qaitbay, and Montaza Palace.',
            price: 129,
            duration: '10 hours',
            groupSize: 'Up to 15',
            icon: '🏖️',
            featured: false
        },
        {
            id: 6,
            name: 'Desert Safari Adventure',
            description: 'Experience the thrill of the Egyptian desert with quad biking, camel rides, and a traditional Bedouin dinner under the stars.',
            price: 95,
            duration: '6 hours',
            groupSize: 'Up to 30',
            icon: '🏜️',
            featured: false
        },
        {
            id: 7,
            name: 'Red Sea Diving Trip',
            description: 'Discover the underwater wonders of the Red Sea with professional diving instructors. Perfect for beginners and experienced divers.',
            price: 149,
            duration: '5 hours',
            groupSize: 'Up to 12',
            icon: '🤿',
            featured: false
        },
        {
            id: 8,
            name: 'Abu Simbel Temples',
            description: 'Visit the magnificent rock temples of Abu Simbel, carved out of a mountainside. Includes flight from Cairo and expert guide.',
            price: 389,
            duration: '12 hours',
            groupSize: 'Up to 20',
            icon: '🗿',
            featured: true
        }
    ];

    const [filteredTours, setFilteredTours] = useState(allTours);
    const [sortOrder, setSortOrder] = useState('asc');
    const [filter, setFilter] = useState('');

    useEffect(() => {
        let updatedTours = [...allTours];

        // Filtering
        if (filter) {
            updatedTours = updatedTours.filter(tour => 
                tour.name.toLowerCase().includes(filter.toLowerCase()) ||
                tour.description.toLowerCase().includes(filter.toLowerCase())
            );
        }

        // Sorting
        updatedTours.sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.price - b.price;
            } else if (sortOrder === 'desc') {
                return b.price - a.price;
            } else if (sortOrder === 'popular') {
                return b.featured ? 1 : -1;
            }
            return 0;
        });

        setFilteredTours(updatedTours);
    }, [sortOrder, filter]);

    return (
        <div className="tours-container">
            <div className="tours-header">
                <h1>Explore Our Tours</h1>
                <p>Discover the wonders of Egypt with our carefully curated tour packages</p>
            </div>

            <div className="tours-controls">
                <input 
                    type="text" 
                    className="search-input"
                    placeholder="🔍 Search tours by name or description..." 
                    value={filter} 
                    onChange={e => setFilter(e.target.value)}
                    aria-label="Search tours"
                />
                <select 
                    className="sort-select"
                    onChange={e => setSortOrder(e.target.value)} 
                    value={sortOrder}
                    aria-label="Sort tours"
                >
                    <option value="popular">Most Popular</option>
                    <option value="asc">Price: Low to High</option>
                    <option value="desc">Price: High to Low</option>
                </select>
            </div>

            {filteredTours.length > 0 ? (
                <div className="tours-grid">
                    {filteredTours.map(tour => (
                        <div 
                            key={tour.id} 
                            className="tour-card"
                            onClick={() => navigate(`/tours/${tour.id}`)}
                        >
                            <div className="tour-card-image">
                                {tour.icon}
                                {tour.featured && (
                                    <span className="tour-card-badge">⭐ Popular</span>
                                )}
                            </div>
                            <div className="tour-card-content">
                                <h3 className="tour-card-title">{tour.name}</h3>
                                <p className="tour-card-description">{tour.description}</p>
                                
                                <div className="tour-card-details">
                                    <div className="tour-detail-item">
                                        <span className="tour-detail-icon">⏱️</span>
                                        <span>{tour.duration}</span>
                                    </div>
                                    <div className="tour-detail-item">
                                        <span className="tour-detail-icon">👥</span>
                                        <span>{tour.groupSize}</span>
                                    </div>
                                </div>

                                <div className="tour-card-footer">
                                    <div className="tour-card-price-container">
                                        <span className="tour-card-price-label">From</span>
                                        <span className="tour-card-price">${tour.price}</span>
                                    </div>
                                    <button className="tour-card-button">
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="no-tours-message">
                    No tours found matching your search. Try different keywords.
                </div>
            )}
        </div>
    );
};

export default Tours;