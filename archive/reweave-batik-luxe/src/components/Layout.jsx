import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Layout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/story', label: 'Our Story' },
    { href: '/shop', label: 'Shop' },
    { href: '/try-on', label: 'Try On' },
    { href: '/community', label: 'Your Reweave' },
    { href: '/impact', label: 'Impact' },
    { href: '/journal', label: 'Journal' },
  ];

  return (
    <div className="min-h-screen bg-ivory">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-soft' : 'bg-transparent'
      }`}>
        <div className="container-custom">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <span className="text-2xl font-display font-bold text-indigo">
                Reweave
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link ${
                    router.pathname === item.href ? 'active' : ''
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-sand transition-colors duration-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <span className={`block h-0.5 bg-indigo transition-all duration-300 ${
                  isMenuOpen ? 'rotate-45 translate-y-1.5' : ''
                }`} />
                <span className={`block h-0.5 bg-indigo transition-all duration-300 ${
                  isMenuOpen ? 'opacity-0' : ''
                }`} />
                <span className={`block h-0.5 bg-indigo transition-all duration-300 ${
                  isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                }`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden transition-all duration-300 ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden bg-white shadow-soft`}>
          <div className="container-custom py-4">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link text-lg ${
                    router.pathname === item.href ? 'active' : ''
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-navy text-ivory">
        <div className="container-custom">
          <div className="py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Brand */}
              <div className="lg:col-span-2">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center">
                    <span className="text-brown font-bold text-xl">R</span>
                  </div>
                  <span className="text-2xl font-display font-bold text-ivory">
                    Reweave
                  </span>
                </div>
                <p className="text-pebble mb-6 max-w-md">
                  Where culture moves with purpose. Sustainable fashion that connects 
                  heritage, community, and environmental responsibility.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="w-10 h-10 bg-sage/20 rounded-lg flex items-center justify-center hover:bg-sage/30 transition-colors duration-300">
                    <span className="sr-only">Instagram</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297z"/>
                    </svg>
                  </a>
                  <a href="#" className="w-10 h-10 bg-sage/20 rounded-lg flex items-center justify-center hover:bg-sage/30 transition-colors duration-300">
                    <span className="sr-only">Facebook</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a href="#" className="w-10 h-10 bg-sage/20 rounded-lg flex items-center justify-center hover:bg-sage/30 transition-colors duration-300">
                    <span className="sr-only">Twitter</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-lg font-display font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li><Link href="/story" className="text-pebble hover:text-ivory transition-colors duration-300">Our Story</Link></li>
                  <li><Link href="/shop" className="text-pebble hover:text-ivory transition-colors duration-300">Shop</Link></li>
                  <li><Link href="/try-on" className="text-pebble hover:text-ivory transition-colors duration-300">Try On</Link></li>
                  <li><Link href="/community" className="text-pebble hover:text-ivory transition-colors duration-300">Community</Link></li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h3 className="text-lg font-display font-semibold mb-4">Support</h3>
                <ul className="space-y-2">
                  <li><Link href="/impact" className="text-pebble hover:text-ivory transition-colors duration-300">Impact</Link></li>
                  <li><Link href="/journal" className="text-pebble hover:text-ivory transition-colors duration-300">Journal</Link></li>
                  <li><a href="#" className="text-pebble hover:text-ivory transition-colors duration-300">Contact</a></li>
                  <li><a href="#" className="text-pebble hover:text-ivory transition-colors duration-300">FAQ</a></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-sage/20 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-pebble text-sm">
                © 2024 Reweave. All rights reserved.
              </p>
              <div className="flex space-x-6">
                <a href="#" className="text-pebble hover:text-ivory transition-colors duration-300 text-sm">Privacy Policy</a>
                <a href="#" className="text-pebble hover:text-ivory transition-colors duration-300 text-sm">Terms of Service</a>
                <a href="#" className="text-pebble hover:text-ivory transition-colors duration-300 text-sm">Accessibility</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
