import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Blog.css';

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const blogPosts = [
    {
      id: 1,
      title: "Top 10 Must-Visit Sites in Egypt",
      excerpt: "Discover the most breathtaking historical sites in Egypt, from the iconic pyramids to hidden temples along the Nile.",
      image: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800&h=500&fit=crop",
      category: "destinations",
      author: "Sarah Johnson",
      date: "2024-01-15",
      readTime: "5 min read"
    },
    {
      id: 2,
      title: "Egyptian Cuisine: A Culinary Journey",
      excerpt: "Explore the rich flavors of Egyptian food, from street food favorites to traditional home-cooked meals.",
      image: "https://images.unsplash.com/photo-1590424763180-c11edd937e8c?w=800&h=500&fit=crop",
      category: "culture",
      author: "Ahmed Hassan",
      date: "2024-01-10",
      readTime: "4 min read"
    },
    {
      id: 3,
      title: "Best Time to Visit Egypt: A Complete Guide",
      excerpt: "Planning your Egyptian adventure? Learn about the best seasons, weather patterns, and festivals to experience.",
      image: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=800&h=500&fit=crop",
      category: "travel-tips",
      author: "Michael Chen",
      date: "2024-01-05",
      readTime: "6 min read"
    },
    {
      id: 4,
      title: "Ancient Egyptian History: Pharaohs and Pyramids",
      excerpt: "Dive deep into the fascinating history of ancient Egypt and the mysteries of the pharaohs.",
      image: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=800&h=500&fit=crop",
      category: "history",
      author: "Dr. Lisa Martinez",
      date: "2023-12-28",
      readTime: "8 min read"
    },
    {
      id: 5,
      title: "Nile River Cruises: Everything You Need to Know",
      excerpt: "A comprehensive guide to choosing the perfect Nile cruise for your Egyptian adventure.",
      image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800&h=500&fit=crop",
      category: "travel-tips",
      author: "Emma Thompson",
      date: "2023-12-20",
      readTime: "7 min read"
    },
    {
      id: 6,
      title: "Egyptian Markets and Bazaars: Shopping Guide",
      excerpt: "Navigate the vibrant markets of Cairo and beyond with our insider tips for the best shopping experience.",
      image: "https://images.unsplash.com/photo-1574082574307-0f5c58f61f0c?w=800&h=500&fit=crop",
      category: "culture",
      author: "Omar Khalil",
      date: "2023-12-15",
      readTime: "5 min read"
    }
  ];

  const categories = [
    { value: 'all', label: 'All Posts' },
    { value: 'destinations', label: 'Destinations' },
    { value: 'culture', label: 'Culture' },
    { value: 'travel-tips', label: 'Travel Tips' },
    { value: 'history', label: 'History' }
  ];

  const filteredPosts = selectedCategory === 'all' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  return (
    <div className="blog-page">
      {/* Hero Section */}
      <div className="blog-hero">
        <div className="container">
          <h1>Travel Blog</h1>
          <p>Stories, tips, and insights from Egypt</p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="blog-filters">
        <div className="container">
          <div className="filter-buttons">
            {categories.map(cat => (
              <button
                key={cat.value}
                className={`filter-btn ${selectedCategory === cat.value ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="blog-content">
        <div className="container">
          <div className="blog-grid">
            {filteredPosts.map(post => (
              <article key={post.id} className="blog-card">
                <Link to={`/blog/${post.id}`} className="blog-card-link">
                  <div className="blog-card-image" style={{ backgroundImage: `url(${post.image})` }}>
                    <span className="blog-category">{post.category.replace('-', ' ')}</span>
                  </div>
                  <div className="blog-card-content">
                    <h2>{post.title}</h2>
                    <p className="blog-excerpt">{post.excerpt}</p>
                    <div className="blog-meta">
                      <span className="blog-author">By {post.author}</span>
                      <span className="blog-date">{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="blog-read-time">{post.readTime}</span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="blog-newsletter">
        <div className="container">
          <div className="newsletter-content">
            <h2>Stay Updated</h2>
            <p>Subscribe to our newsletter for the latest travel tips and destination guides</p>
            <form className="newsletter-form">
              <input type="email" placeholder="Enter your email" required />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
