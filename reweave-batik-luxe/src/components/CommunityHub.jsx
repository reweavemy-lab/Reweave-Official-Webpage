import React, { useState, useEffect } from 'react';
import Layout from './Layout';

const CommunityHub = () => {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const filters = [
    { id: 'all', label: 'All Posts', icon: '🌟' },
    { id: 'fits', label: 'Fits', icon: '👗' },
    { id: 'lifestyle', label: 'Lifestyle', icon: '📸' },
    { id: 'sustainability', label: 'Sustainability', icon: '🌱' },
    { id: 'artisan', label: 'Artisan Stories', icon: '🎨' }
  ];

  // Sample community posts
  const samplePosts = [
    {
      id: 1,
      user: 'Sarah Chen',
      avatar: '/images/avatars/sarah.jpg',
      image: '/images/community/sarah-fit.jpg',
      caption: 'Loving my new Batik Pickleball Tote! Perfect for my morning matches 🏓',
      product: 'Batik Pickleball Tote',
      tags: ['fits', 'lifestyle'],
      likes: 24,
      comments: 8,
      timestamp: '2 hours ago',
      verified: true
    },
    {
      id: 2,
      user: 'Marcus Rodriguez',
      avatar: '/images/avatars/marcus.jpg',
      image: '/images/community/marcus-lifestyle.jpg',
      caption: 'Taking my Heritage Backpack on a weekend hike. The craftsmanship is incredible!',
      product: 'Heritage Backpack',
      tags: ['lifestyle', 'sustainability'],
      likes: 18,
      comments: 5,
      timestamp: '5 hours ago',
      verified: false
    },
    {
      id: 3,
      user: 'Aisha Patel',
      avatar: '/images/avatars/aisha.jpg',
      image: '/images/community/aisha-artisan.jpg',
      caption: 'Met the amazing artisans who made my bag. Their stories inspire me every day ✨',
      product: 'Artisan Crossbody',
      tags: ['artisan', 'sustainability'],
      likes: 32,
      comments: 12,
      timestamp: '1 day ago',
      verified: true
    },
    {
      id: 4,
      user: 'David Kim',
      avatar: '/images/avatars/david.jpg',
      image: '/images/community/david-sustainability.jpg',
      caption: 'Proud to be part of a community that values sustainability and cultural heritage 🌍',
      product: 'Batik Pickleball Tote',
      tags: ['sustainability'],
      likes: 15,
      comments: 3,
      timestamp: '2 days ago',
      verified: false
    }
  ];

  useEffect(() => {
    setPosts(samplePosts);
  }, []);

  const filteredPosts = posts.filter(post => 
    filter === 'all' || post.tags.includes(filter)
  );

  const handleUpload = async (formData) => {
    setIsUploading(true);
    
    // Simulate upload process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Add new post to the list
    const newPost = {
      id: posts.length + 1,
      user: 'You',
      avatar: '/images/avatars/default.jpg',
      image: formData.image,
      caption: formData.caption,
      product: formData.product,
      tags: formData.tags,
      likes: 0,
      comments: 0,
      timestamp: 'Just now',
      verified: false
    };
    
    setPosts(prev => [newPost, ...prev]);
    setIsUploading(false);
    setShowUploadModal(false);
  };

  const handleLike = (postId) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    ));
  };

  return (
    <Layout>
      <div className="min-h-screen bg-ivory py-16">
        <div className="container-custom">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-indigo mb-6">
              Your Reweave
            </h1>
            <p className="text-xl text-pebble max-w-3xl mx-auto mb-8">
              Join our community of conscious consumers. Share your style, connect with like-minded individuals, 
              and celebrate the stories behind your Reweave pieces.
            </p>
            
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn btn-primary text-lg px-8 py-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Share Your Fit
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {filters.map((filterItem) => (
              <button
                key={filterItem.id}
                onClick={() => setFilter(filterItem.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  filter === filterItem.id
                    ? 'bg-sage text-white'
                    : 'bg-white text-pebble hover:bg-sand hover:text-indigo'
                }`}
              >
                <span className="mr-2">{filterItem.icon}</span>
                {filterItem.label}
              </button>
            ))}
          </div>

          {/* Community Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <div key={post.id} className="card overflow-hidden">
                {/* Post Header */}
                <div className="p-4 border-b border-sand">
                  <div className="flex items-center space-x-3">
                    <img
                      src={post.avatar}
                      alt={post.user}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-indigo">{post.user}</h3>
                        {post.verified && (
                          <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <p className="text-sm text-pebble">{post.timestamp}</p>
                    </div>
                  </div>
                </div>

                {/* Post Image */}
                <div className="relative">
                  <img
                    src={post.image}
                    alt={post.caption}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-indigo">
                    {post.product}
                  </div>
                </div>

                {/* Post Content */}
                <div className="p-4">
                  <p className="text-pebble mb-4">{post.caption}</p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-sage/20 text-sage text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleLike(post.id)}
                        className="flex items-center space-x-2 text-pebble hover:text-terracotta transition-colors duration-300"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center space-x-2 text-pebble hover:text-terracotta transition-colors duration-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>{post.comments}</span>
                      </button>
                    </div>
                    <button className="text-pebble hover:text-terracotta transition-colors duration-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Upload Modal */}
          {showUploadModal && (
            <UploadModal
              onClose={() => setShowUploadModal(false)}
              onUpload={handleUpload}
              isUploading={isUploading}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

// Upload Modal Component
const UploadModal = ({ onClose, onUpload, isUploading }) => {
  const [formData, setFormData] = useState({
    image: null,
    caption: '',
    product: '',
    tags: []
  });

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, image: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.image && formData.caption && formData.product) {
      onUpload(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-semibold text-indigo">Share Your Fit</h2>
          <button
            onClick={onClose}
            className="text-pebble hover:text-indigo transition-colors duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-indigo mb-2">Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="form-input"
              required
            />
            {formData.image && (
              <img
                src={formData.image}
                alt="Preview"
                className="w-full h-32 object-cover rounded-xl mt-2"
              />
            )}
          </div>

          {/* Caption */}
          <div>
            <label className="block text-sm font-medium text-indigo mb-2">Caption</label>
            <textarea
              value={formData.caption}
              onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
              placeholder="Tell us about your Reweave piece..."
              className="form-textarea h-24"
              required
            />
          </div>

          {/* Product */}
          <div>
            <label className="block text-sm font-medium text-indigo mb-2">Product</label>
            <select
              value={formData.product}
              onChange={(e) => setFormData(prev => ({ ...prev, product: e.target.value }))}
              className="form-input"
              required
            >
              <option value="">Select a product</option>
              <option value="Batik Pickleball Tote">Batik Pickleball Tote</option>
              <option value="Heritage Backpack">Heritage Backpack</option>
              <option value="Artisan Crossbody">Artisan Crossbody</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-indigo mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {['fits', 'lifestyle', 'sustainability', 'artisan'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      tags: prev.tags.includes(tag)
                        ? prev.tags.filter(t => t !== tag)
                        : [...prev.tags, tag]
                    }));
                  }}
                  className={`px-3 py-1 rounded-full text-sm transition-colors duration-300 ${
                    formData.tags.includes(tag)
                      ? 'bg-sage text-white'
                      : 'bg-sand text-pebble hover:bg-sage hover:text-white'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="btn btn-primary flex-1"
            >
              {isUploading ? 'Uploading...' : 'Share'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommunityHub;
