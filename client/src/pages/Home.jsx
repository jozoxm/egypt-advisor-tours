import React from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();

    const featuredTours = [
        {
            id: 1,
            name: 'Pyramids of Giza Tour',
            description: 'Explore the iconic pyramids and the Great Sphinx, one of the Seven Wonders of the Ancient World.',
            price: 89,
            icon: '🏛️'
        },
        {
            id: 2,
            name: 'Nile River Cruise',
            description: 'Sail along the legendary Nile River and discover ancient temples and historic landmarks.',
            price: 299,
            icon: '🚢'
        },
        {
            id: 3,
            name: 'Luxor & Valley of Kings',
            description: 'Visit the magnificent temples of Luxor and explore the tombs in the Valley of the Kings.',
            price: 199,
            icon: '⛰️'
        }
    ];

    const features = [
        {
            icon: '👨‍🏫',
            title: 'Expert Guides',
            description: 'Our knowledgeable guides bring Egyptian history to life with fascinating stories and insights.'
        },
        {
            icon: '⭐',
            title: 'Top Rated',
            description: 'Consistently rated 5 stars by thousands of satisfied travelers from around the world.'
        },
        {
            icon: '💰',
            title: 'Best Value',
            description: 'Competitive pricing with no hidden fees. Get the most out of your Egyptian adventure.'
        },
        {
            icon: '🛡️',
            title: 'Safe & Secure',
            description: 'Your safety is our priority. All tours follow strict safety protocols and guidelines.'
        }
    ];

    const guides = [
        {
            title: 'Egyptian Phrases',
            description: 'Learn essential Arabic phrases to enhance your travel experience and connect with locals.',
            icon: '💬',
            path: '/egyptian-phrases'
        },
        {
            title: 'Egyptian Food Guide',
            description: 'Discover the rich flavors of Egyptian cuisine and must-try dishes during your visit.',
            icon: '🍽️',
            path: '/egyptian-food'
        },
        {
            title: 'Travel Tips',
            description: 'Get insider tips on the best times to visit, what to pack, and cultural etiquette.',
            icon: '✈️',
            path: '/about'
        }
    ];

    return (
        <div className="home-container">
            <Hero />
            
            <section id="featured-tours" className="section">
                <h2>Featured Tours</h2>
                <p className="section-subtitle">
                    Discover our most popular tours and experiences in Egypt
                </p>
                <div className="featured-tours-grid">
                    {featuredTours.map(tour => (
                        <div 
                            key={tour.id} 
                            className="tour-preview-card"
                            onClick={() => navigate('/tours')}
                        >
                            <div className="tour-preview-image">
                                {tour.icon}
                            </div>
                            <div className="tour-preview-content">
                                <h3 className="tour-preview-title">{tour.name}</h3>
                                <p className="tour-preview-description">{tour.description}</p>
                                <div className="tour-preview-footer">
                                    <span className="tour-preview-price">From ${tour.price}</span>
                                    <span style={{ color: '#999' }}>per person</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <button className="view-all-button" onClick={() => navigate('/tours')}>
                    View All Tours
                </button>
            </section>

            <section id="why-choose-us" className="section why-choose-us">
                <h2>Why Choose Us</h2>
                <p className="section-subtitle">
                    Experience the difference with Egypt Advisor Tours
                </p>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div key={index} className="feature-card">
                            <div className="feature-icon">{feature.icon}</div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section id="cta-tailor-trip" className="cta-section">
                <h2>Create Your Dream Trip</h2>
                <p>
                    Every traveler is unique. Let us design a personalized itinerary 
                    that matches your interests, budget, and schedule.
                </p>
                <button className="cta-button" onClick={() => navigate('/tailor-trip')}>
                    Start Planning ✨
                </button>
            </section>

            <section id="explore-guides" className="section">
                <h2>Explore Our Guides</h2>
                <p className="section-subtitle">
                    Everything you need to know for an amazing Egyptian adventure
                </p>
                <div className="guides-grid">
                    {guides.map((guide, index) => (
                        <div 
                            key={index} 
                            className="guide-card"
                            onClick={() => navigate(guide.path)}
                        >
                            <div className="guide-icon-container">
                                {guide.icon}
                            </div>
                            <div className="guide-content">
                                <h3>{guide.title}</h3>
                                <p>{guide.description}</p>
                                <button className="guide-button">
                                    Learn More →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;