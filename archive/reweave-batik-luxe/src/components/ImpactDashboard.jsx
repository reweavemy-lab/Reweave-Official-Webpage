import React, { useState, useEffect } from 'react';
import Layout from './Layout';

const ImpactDashboard = () => {
  const [metrics, setMetrics] = useState({
    artisansEmployed: 0,
    wagesPaid: 0,
    bagsSold: 0,
    wasteDiverted: 0,
    waterSaved: 0,
    carbonReduced: 0
  });

  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Animate numbers on load
  useEffect(() => {
    const targetMetrics = {
      artisansEmployed: 450,
      wagesPaid: 125000,
      bagsSold: 2500,
      wasteDiverted: 18500,
      waterSaved: 2400000,
      carbonReduced: 45000
    };

    const animateNumber = (key, target, duration = 2000) => {
      const start = Date.now();
      const startValue = 0;
      
      const animate = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(startValue + (target - startValue) * progress);
        
        setMetrics(prev => ({ ...prev, [key]: current }));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      animate();
    };

    // Start animations with slight delays
    Object.entries(targetMetrics).forEach(([key, value], index) => {
      setTimeout(() => animateNumber(key, value), index * 200);
    });

    // Load stories
    setTimeout(() => {
      setStories([
        {
          id: 1,
          title: 'Maria\'s Story: From Struggle to Success',
          location: 'Guatemala',
          image: '/images/impact/maria-story.jpg',
          excerpt: 'Maria, a master weaver from Guatemala, has been able to provide education for her children and healthcare for her family through our fair trade partnership.',
          impact: '3x increase in income',
          date: '2024-01-15'
        },
        {
          id: 2,
          title: 'Revitalizing Cotton Farming',
          location: 'India',
          image: '/images/impact/cotton-farming.jpg',
          excerpt: 'Our partnership with small-scale organic cotton farmers has helped restore soil health and biodiversity while eliminating harmful pesticides.',
          impact: '50% reduction in water usage',
          date: '2024-01-10'
        },
        {
          id: 3,
          title: 'Community Education Program',
          location: 'Indonesia',
          image: '/images/impact/education.jpg',
          excerpt: 'We\'ve established education programs in our partner communities, providing literacy classes and vocational training for women.',
          impact: '200+ women trained',
          date: '2024-01-05'
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const progressGoals = [
    {
      title: 'Sustainable Materials',
      current: 78,
      target: 100,
      unit: '%',
      description: 'of our materials are now certified organic, recycled, or regeneratively sourced'
    },
    {
      title: 'Carbon Reduction',
      current: 45,
      target: 100,
      unit: '%',
      description: 'reduction in carbon footprint compared to our 2019 baseline'
    },
    {
      title: 'Artisan Network',
      current: 450,
      target: 1000,
      unit: '',
      description: 'artisans employed toward our goal of 1,000'
    },
    {
      title: 'Plastic-Free Packaging',
      current: 92,
      target: 100,
      unit: '%',
      description: 'of our packaging is now plastic-free and compostable'
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-ivory py-16">
        <div className="container-custom">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-indigo mb-6">
              Our Impact Dashboard
            </h1>
            <p className="text-xl text-pebble max-w-3xl mx-auto">
              Transparency is at the core of our mission. Track our progress in creating 
              positive environmental and social change through sustainable fashion.
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="metric-card">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-sage/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="metric-value">{formatNumber(metrics.artisansEmployed)}+</div>
                  <div className="metric-label">Artisans Employed</div>
                </div>
              </div>
              <p className="text-sm text-pebble">
                We provide fair wages and safe working conditions to skilled artisans across our partner communities.
              </p>
            </div>

            <div className="metric-card">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gold/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="metric-value">${formatNumber(metrics.wagesPaid)}</div>
                  <div className="metric-label">Wages Paid</div>
                </div>
              </div>
              <p className="text-sm text-pebble">
                Direct wages paid to artisans and their families, supporting local economies.
              </p>
            </div>

            <div className="metric-card">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-terracotta/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="metric-value">{formatNumber(metrics.bagsSold)}</div>
                  <div className="metric-label">Bags Sold</div>
                </div>
              </div>
              <p className="text-sm text-pebble">
                Handcrafted bags sold, each representing a story of cultural preservation.
              </p>
            </div>

            <div className="metric-card">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-sage/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="metric-value">{formatNumber(metrics.wasteDiverted)} lbs</div>
                  <div className="metric-label">Waste Diverted</div>
                </div>
              </div>
              <p className="text-sm text-pebble">
                Textile waste diverted from landfills through our upcycling initiatives.
              </p>
            </div>

            <div className="metric-card">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-indigo/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="metric-value">{formatNumber(metrics.waterSaved)} gal</div>
                  <div className="metric-label">Water Saved</div>
                </div>
              </div>
              <p className="text-sm text-pebble">
                Water saved through sustainable production processes and water recycling.
              </p>
            </div>

            <div className="metric-card">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gold/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="metric-value">{formatNumber(metrics.carbonReduced)} kg</div>
                  <div className="metric-label">CO2 Reduced</div>
                </div>
              </div>
              <p className="text-sm text-pebble">
                Carbon emissions reduced through sustainable practices and renewable energy.
              </p>
            </div>
          </div>

          {/* Progress Goals */}
          <div className="mb-16">
            <h2 className="text-3xl font-display font-bold text-indigo mb-8 text-center">
              Our 2025 Sustainability Goals
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {progressGoals.map((goal, index) => (
                <div key={index} className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-indigo">{goal.title}</h3>
                    <span className="text-2xl font-bold text-sage">
                      {goal.current}{goal.unit}
                    </span>
                  </div>
                  <div className="w-full bg-sand rounded-full h-3 mb-3">
                    <div 
                      className="bg-gradient-to-r from-sage to-terracotta h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${(goal.current / goal.target) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-pebble">{goal.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Impact Stories */}
          <div className="mb-16">
            <h2 className="text-3xl font-display font-bold text-indigo mb-8 text-center">
              Impact Stories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {stories.map((story) => (
                <div key={story.id} className="card overflow-hidden">
                  <div className="relative">
                    <img
                      src={story.image}
                      alt={story.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-indigo">
                      {story.location}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-indigo mb-2">{story.title}</h3>
                    <p className="text-pebble text-sm mb-4">{story.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-sage">{story.impact}</span>
                      <span className="text-xs text-pebble">{story.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center bg-gradient-to-br from-indigo to-navy text-white rounded-2xl p-12">
            <h2 className="text-3xl font-display font-bold mb-4">
              Join Our Impact Journey
            </h2>
            <p className="text-xl text-sand mb-8 max-w-2xl mx-auto">
              Every purchase contributes to our mission of creating positive environmental 
              and social change. Follow our progress, share your ideas, and be part of the solution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/shop" className="btn bg-white text-indigo hover:bg-sand text-lg px-8 py-4">
                Shop Sustainable Products
              </a>
              <a href="/community" className="btn border-2 border-white text-white hover:bg-white hover:text-indigo text-lg px-8 py-4">
                Join Our Community
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ImpactDashboard;
