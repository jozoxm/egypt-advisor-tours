import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TourCard from '../components/TourCard';
import './Tours.css';

const Tours = () => {
    const [tours, setTours] = useState([]);
    const [filteredTours, setFilteredTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState('asc');
    const [filter, setFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    useEffect(() => {
        const fetchTours = async () => {
            try {
                const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
                const response = await axios.get(`${API_URL}/tours`);
                setTours(response.data);
                setFilteredTours(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching tours:', error);
                setLoading(false);
            }
        };

        fetchTours();
    }, []);

    useEffect(() => {
        let updatedTours = [...tours];

        // Category filtering
        if (categoryFilter !== 'all') {
            updatedTours = updatedTours.filter(tour => 
                tour.category.toLowerCase() === categoryFilter.toLowerCase()
            );
        }

        // Text filtering
        if (filter) {
            updatedTours = updatedTours.filter(tour => 
                tour.title.toLowerCase().includes(filter.toLowerCase()) ||
                tour.description.toLowerCase().includes(filter.toLowerCase())
            );
        }

        // Sorting
        updatedTours.sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.price - b.price;
            } else if (sortOrder === 'desc') {
                return b.price - a.price;
            } else if (sortOrder === 'rating') {
                return b.rating - a.rating;
            }
            return 0;
        });

        setFilteredTours(updatedTours);
    }, [tours, sortOrder, filter, categoryFilter]);

    const categories = ['all', 'historical', 'cruise', 'adventure', 'entertainment'];

    return (
        <div className="tours-page">
            <div className="tours-header">
                <h1>Explore Our Tours</h1>
                <p>Discover the best of Egypt with our carefully curated tours</p>
            </div>

            <div className="tours-container">
                <div className="filters-section">
                    <div className="filter-group">
                        <label>Search Tours:</label>
                        <input 
                            type="text" 
                            placeholder="Search by name or description..." 
                            value={filter} 
                            onChange={e => setFilter(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <div className="filter-group">
                        <label>Category:</label>
                        <div className="category-buttons">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    className={`category-btn ${categoryFilter === cat ? 'active' : ''}`}
                                    onClick={() => setCategoryFilter(cat)}
                                >
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="filter-group">
                        <label>Sort By:</label>
                        <select 
                            onChange={e => setSortOrder(e.target.value)} 
                            value={sortOrder}
                            className="sort-select"
                        >
                            <option value="asc">Price: Low to High</option>
                            <option value="desc">Price: High to Low</option>
                            <option value="rating">Highest Rated</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="loading">Loading tours...</div>
                ) : filteredTours.length === 0 ? (
                    <div className="no-results">
                        <p>No tours found matching your criteria.</p>
                    </div>
                ) : (
                    <div className="tours-grid">
                        {filteredTours.map(tour => (
                            <TourCard key={tour._id} tour={tour} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Tours;