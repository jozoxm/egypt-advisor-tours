import React from 'react';
import { blogs as defaultBlogs } from '../data/blogs-data';
import useSeoMeta from '../hooks/useSeoMeta';
import getSiteUrl from '../utils/siteUrl';

const formatBlogDate = (dateString) => {
  const parsedDate = new Date(dateString);
  if (Number.isNaN(parsedDate.getTime())) return 'Date unavailable';
  return parsedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const BlogsPage = ({ onTailorTrip, blogs = defaultBlogs }) => {
  const siteUrl = getSiteUrl();

  useSeoMeta({
    title: 'Travel Blogs',
    description:
      'Read travel insights, practical tips, and Egypt cultural guides from the Egypt Advisor Tours team.',
    path: '/blogs',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Egypt Advisor Tours Blog',
      url: `${siteUrl}/blogs`,
      blogPost: blogs.map((blog) => ({
        '@type': 'BlogPosting',
        headline: blog.title,
        datePublished: blog.date,
        author: {
          '@type': 'Person',
          name: blog.author || 'Egypt Advisor Team',
        },
        description: blog.excerpt || '',
        url: `${siteUrl}/blogs#${blog.id}`,
      })),
    },
  });

  return (
  <section className="blogs">
    <div className="section-header">
      <h2>Travel Insights &amp; Blogs</h2>
      <p>Fresh stories, tips, and cultural guides to help you craft the perfect journey through Egypt</p>
    </div>

    <div className="blogs-grid">
      {blogs.map((blog) => (
        <article key={blog.id} className="blog-card">
          <div className="blog-icon">{blog.image}</div>
          <div className="blog-content">
            <div className="blog-meta">
              <span className="blog-category">{blog.category}</span>
              <span className="blog-date">{formatBlogDate(blog.date)}</span>
            </div>
            <h3>{blog.title}</h3>
            <p className="blog-excerpt">{blog.excerpt}</p>
            <div className="blog-footer">
              <span className="blog-author">By {blog.author}</span>
              <button className="text-button" onClick={onTailorTrip}>
                Tailor a trip like this →
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  </section>
  );
};

export default BlogsPage;
