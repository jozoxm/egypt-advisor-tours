import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Hero from '../components/Hero';
import TourCard from '../components/TourCard';
import './Home.css';

const Home = () => {
    const [featuredTours, setFeaturedTours] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeaturedTours = async () => {
            try {
                const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
                const response = await axios.get(`${API_URL}/tours/featured`);
                setFeaturedTours(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching featured tours:', error);
                setLoading(false);
            }
        };

        fetchFeaturedTours();
    }, []);

    return (
        <div className="home">
            <Hero />
            
            <section id="featured-tours" className="featured-tours-section">
                <div className="container">
                    <h2>Featured Tours</h2>
                    <p className="section-subtitle">Discover our most popular Egyptian adventures</p>
                    
                    {loading ? (
                        <div className="loading">Loading tours...</div>
                    ) : (
                        <div className="tours-grid">
                            {featuredTours.map(tour => (
                                <TourCard key={tour._id} tour={tour} />
                            ))}
                        </div>
                    )}
                    
                    <div className="view-all-container">
                        <Link to="/tours" className="btn-view-all">View All Tours</Link>
                    </div>
                </div>
            </section>

            <section id="why-choose-us" className="why-choose-us-section">
                <div className="container">
                    <h2>Why Choose Egypt Advisor Tours</h2>
                    <p className="section-subtitle">We make your Egyptian adventure extraordinary</p>
                    
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">🏛️</div>
                            <h3>Expert Guides</h3>
                            <p>Our professional Egyptologists bring history to life with fascinating stories and deep knowledge of ancient Egypt.</p>
                        </div>
                        
                        <div className="feature-card">
                            <div className="feature-icon">⭐</div>
                            <h3>Best Value</h3>
                            <p>Competitive prices without compromising on quality. We offer the best tours at the most reasonable rates.</p>
                        </div>
                        
                        <div className="feature-card">
                            <div className="feature-icon">🚐</div>
                            <h3>Comfortable Transport</h3>
                            <p>Travel in air-conditioned vehicles with experienced drivers for a safe and comfortable journey.</p>
                        </div>
                        
                        <div className="feature-card">
                            <div className="feature-icon">🎯</div>
                            <h3>Customizable Tours</h3>
                            <p>Tailor your itinerary to match your interests and schedule. We create personalized experiences just for you.</p>
                        </div>
                        
                        <div className="feature-card">
                            <div className="feature-icon">🛡️</div>
                            <h3>Safety First</h3>
                            <p>Your safety is our priority. We follow all safety protocols and work with trusted partners.</p>
                        </div>
                        
                        <div className="feature-card">
                            <div className="feature-icon">💬</div>
                            <h3>24/7 Support</h3>
                            <p>Our team is always available to assist you before, during, and after your trip.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="cta-tailor-trip" className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2>Create Your Dream Egyptian Adventure</h2>
                        <p>Can't find the perfect tour? Let us design a custom itinerary just for you! Whether you want to explore ancient temples, cruise the Nile, or discover hidden gems, we'll create the perfect experience tailored to your interests and budget.</p>
                        <Link to="/tailor-trip" className="btn-cta">Tailor Your Trip</Link>
                    </div>
                </div>
            </section>

            <section id="explore-guides" className="explore-guides-section">
                <div className="container">
                    <h2>Explore Our Guides</h2>
                    <p className="section-subtitle">Essential information for your Egyptian journey</p>
                    
                    <div className="guides-grid">
                        <Link to="/egyptian-phrases" className="guide-card">
                            <div className="guide-image" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop)'}}>
                                <div className="guide-overlay">
                                    <h3>Egyptian Phrases</h3>
                                    <p>Learn essential Arabic phrases for your trip</p>
                                </div>
                            </div>
                        </Link>
                        
                        <Link to="/egyptian-food" className="guide-card">
                            <div className="guide-image" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop)'}}>
                                <div className="guide-overlay">
                                    <h3>Egyptian Food</h3>
                                    <p>Discover delicious traditional Egyptian cuisine</p>
                                </div>
                            </div>
                        </Link>
                        
                        <Link to="/about" className="guide-card">
                            <div className="guide-image" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1539768942893-daf53e448371?w=800&auto=format&fit=crop)'}}>
                                <div className="guide-overlay">
                                    <h3>About Egypt</h3>
                                    <p>Learn about Egyptian culture and history</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;