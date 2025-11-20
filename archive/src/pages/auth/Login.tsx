import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShoppingBag,
  Phone,
  User
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store authentication token
      localStorage.setItem('reweave-auth-token', 'mock-token-123');
      localStorage.setItem('reweave-user', JSON.stringify({
        id: 'user-123',
        firstName: 'Sarah',
        lastName: 'Lim',
        email: email,
        loyaltyPoints: 2850,
        loyaltyTier: 'gold'
      }));

      // Redirect to dashboard or previous page
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    // Simulate social login
    localStorage.setItem('reweave-auth-token', 'social-token-123');
    localStorage.setItem('reweave-user', JSON.stringify({
      id: 'user-social-123',
      firstName: 'Social',
      lastName: 'User',
      email: `${provider}@user.com`,
      loyaltyPoints: 0,
      loyaltyTier: 'bronze'
    }));
    navigate('/dashboard');
  };

  const handleMagicLink = async () => {
    if (!email) {
      alert('Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    try {
      // Simulate magic link API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Magic link sent to your email! Check your inbox.');
    } catch (error) {
      console.error('Magic link failed:', error);
      alert('Failed to send magic link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory to-sand/20 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-sage rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-display font-bold text-indigo">Reweave</span>
          </Link>
          <h2 className="text-2xl font-bold text-indigo mb-2">Welcome Back</h2>
          <p className="text-pebble">Sign in to your account to continue shopping</p>
        </div>

        <div className="bg-white rounded-2xl shadow-strong p-8">
          {/* Login Method Toggle */}
          <div className="flex bg-sand/20 rounded-xl p-1 mb-6">
            <button
              onClick={() => setLoginMethod('email')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors ${
                loginMethod === 'email' ? 'bg-white text-indigo shadow-medium' : 'text-pebble hover:text-indigo'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span className="text-sm font-medium">Email</span>
            </button>
            <button
              onClick={() => setLoginMethod('phone')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors ${
                loginMethod === 'phone' ? 'bg-white text-indigo shadow-medium' : 'text-pebble hover:text-indigo'
              }`}
            >
              <Phone className="w-4 h-4" />
              <span className="text-sm font-medium">Phone</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {loginMethod === 'email' ? (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-indigo mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pebble" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-indigo mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pebble" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage"
                    placeholder="+60 12-345 6789"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-indigo mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pebble" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-pebble hover:text-indigo"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-sage focus:ring-sage border-sand rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-pebble">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/auth/forgot-password" className="font-medium text-sage hover:text-sage/80">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  Sign In
                  <ArrowRight className="ml-2 w-5 h-5" />
                </span>
              )}
            </button>
          </form>

          {/* Magic Link Option */}
          <div className="mt-6">
            <button
              onClick={handleMagicLink}
              disabled={isLoading}
              className="w-full btn btn-outline"
            >
              {isLoading ? 'Sending...' : 'Send Magic Link Instead'}
            </button>
          </div>

          {/* Social Login */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-sand" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-pebble">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSocialLogin('google')}
                className="w-full inline-flex justify-center py-3 px-4 border border-sand rounded-xl shadow-medium bg-white text-sm font-medium text-pebble hover:bg-sand/20"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="ml-2">Google</span>
              </button>

              <button
                onClick={() => handleSocialLogin('apple')}
                className="w-full inline-flex justify-center py-3 px-4 border border-sand rounded-xl shadow-medium bg-white text-sm font-medium text-pebble hover:bg-sand/20"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.04-.03zM12.03 7.25c-.15-2.23 1.66-4.15 3.95-4.25.29 2.58-2.34 4.5-3.95 4.25z"/>
                </svg>
                <span className="ml-2">Apple</span>
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-pebble">
              Don't have an account?{' '}
              <Link to="/auth/register" className="font-medium text-sage hover:text-sage/80">
                Sign up now
              </Link>
            </p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 text-center">
          <p className="text-xs text-pebble">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="text-sage hover:text-sage/80">Terms of Service</Link> and{' '}
            <Link to="/privacy" className="text-sage hover:text-sage/80">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}