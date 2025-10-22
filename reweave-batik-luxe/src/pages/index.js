import React, { useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';

const HomePage = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    // Auto-play video when component mounts
    if (videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
  }, []);

  const pillars = [
    {
      title: 'Culture',
      description: 'We celebrate and preserve traditional craftsmanship and cultural heritage through our designs and production methods.',
      icon: '🎨',
      link: '/story',
      color: 'from-indigo to-navy'
    },
    {
      title: 'Community',
      description: 'We empower local artisans and communities by providing fair wages, training, and sustainable livelihoods.',
      icon: '🤝',
      link: '/community',
      color: 'from-sage to-terracotta'
    },
    {
      title: 'Sustainability',
      description: 'We\'re committed to environmental responsibility through sustainable materials, ethical production, and waste reduction.',
      icon: '🌱',
      link: '/impact',
      color: 'from-gold to-sage'
    }
  ];

  const featuredProduct = {
    name: 'Batik Pickleball Tote',
    price: '$89',
    description: 'Handcrafted by skilled artisans using reclaimed textiles, this versatile tote combines traditional weaving techniques with modern design.',
    image: '/images/batik-pickleball-tote.jpg',
    link: '/shop/batik-pickleball-tote'
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 w-full h-full">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
            poster="/images/hero-poster.jpg"
          >
            <source src="/videos/artisans-athletes.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 hero-overlay"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 animate-fade-in">
            Where Culture Moves
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-sand animate-slide-up">
            Designed for Movement. Rooted in Meaning.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Link href="/shop" className="btn btn-primary text-lg px-8 py-4">
              Shop Collection
            </Link>
            <Link href="/try-on" className="btn btn-outline text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-indigo">
              Try It On
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-float">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-bounce"></div>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="section-padding bg-ivory">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-indigo mb-6">
              Our Pillars
            </h2>
            <p className="text-xl text-pebble max-w-3xl mx-auto">
              Reweave stands on three fundamental pillars that guide everything we do.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pillars.map((pillar, index) => (
              <div key={index} className="card-luxury p-8 text-center group hover:shadow-strong transition-all duration-500">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br ${pillar.color} flex items-center justify-center text-2xl`}>
                  {pillar.icon}
                </div>
                <h3 className="text-2xl font-display font-semibold text-indigo mb-4">
                  {pillar.title}
                </h3>
                <p className="text-pebble mb-6 leading-relaxed">
                  {pillar.description}
                </p>
                <Link 
                  href={pillar.link}
                  className="btn btn-ghost group-hover:bg-sage group-hover:text-white transition-all duration-300"
                >
                  Learn More
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Product Section */}
      <section className="section-padding bg-gradient-to-br from-sand to-ivory">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-indigo mb-6">
                Featured Product
              </h2>
              <h3 className="text-2xl font-display font-semibold text-brown mb-4">
                {featuredProduct.name}
              </h3>
              <p className="text-lg text-pebble mb-6 leading-relaxed">
                {featuredProduct.description}
              </p>
              <div className="flex items-center space-x-4 mb-8">
                <span className="text-3xl font-bold text-indigo">{featuredProduct.price}</span>
                <div className="flex items-center space-x-2">
                  <div className="flex text-gold">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="text-pebble">(24 reviews)</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={featuredProduct.link} className="btn btn-primary text-lg px-8 py-4">
                  View Details
                </Link>
                <Link href="/try-on" className="btn btn-secondary text-lg px-8 py-4">
                  Try It On
                </Link>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative">
                <div className="aspect-square rounded-2xl overflow-hidden shadow-strong">
                  <img 
                    src={featuredProduct.image} 
                    alt={featuredProduct.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="absolute -top-4 -right-4 bg-gold text-brown px-4 py-2 rounded-full font-semibold text-sm">
                  Best Seller
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community CTA Section */}
      <section className="section-padding bg-indigo text-white">
        <div className="container-custom text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Join Our Community
          </h2>
          <p className="text-xl text-sand mb-8 max-w-3xl mx-auto">
            Share your style, connect with like-minded individuals, and be part of the sustainable fashion movement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/try-on" className="btn bg-white text-indigo hover:bg-sand text-lg px-8 py-4">
              Try On Our Products
            </Link>
            <Link href="/community" className="btn border-2 border-white text-white hover:bg-white hover:text-indigo text-lg px-8 py-4">
              View Community Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="section-padding bg-gradient-to-br from-sage to-terracotta text-white">
        <div className="container-custom text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Stay Connected
          </h2>
          <p className="text-xl text-sand mb-8 max-w-2xl mx-auto">
            Get the latest updates on our collections, artisan stories, and sustainable fashion insights.
          </p>
          <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
            <input 
              type="email" 
              placeholder="Enter your email address"
              className="form-input flex-1 text-brown placeholder-pebble"
              required
            />
            <button 
              type="submit"
              className="btn bg-gold text-brown hover:bg-white hover:text-indigo px-8 py-3"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
