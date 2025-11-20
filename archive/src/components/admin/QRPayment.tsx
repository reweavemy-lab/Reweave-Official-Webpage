import { useState, useEffect } from 'react';
import { QrCode, Clock, CheckCircle, XCircle, Download, Share2, CreditCard, RefreshCw } from 'lucide-react';

interface QRPaymentProps {
  amount: number;
  orderId: string;
  paymentMethod: string;
  onSuccess: () => void;
  onCancel: () => void;
  customerName: string;
}

interface PaymentProvider {
  id: string;
  name: string;
  color: string;
  qrCode: string;
  processingTime: string;
  maxAmount: number;
}

const paymentProviders: PaymentProvider[] = [
  {
    id: 'touchngo',
    name: 'Touch n Go eWallet',
    color: 'bg-blue-500',
    qrCode: 'TNG_QR_TEMPLATE',
    processingTime: 'Instant',
    maxAmount: 5000
  },
  {
    id: 'grabpay',
    name: 'GrabPay',
    color: 'bg-green-500',
    qrCode: 'GRAB_QR_TEMPLATE',
    processingTime: 'Instant',
    maxAmount: 10000
  },
  {
    id: 'boost',
    name: 'Boost',
    color: 'bg-orange-500',
    qrCode: 'BOOST_QR_TEMPLATE',
    processingTime: 'Instant',
    maxAmount: 5000
  },
  {
    id: 'fpx',
    name: 'FPX Online Banking',
    color: 'bg-purple-500',
    qrCode: 'FPX_QR_TEMPLATE',
    processingTime: '1-2 minutes',
    maxAmount: 30000
  }
];

export default function QRPayment({ amount, orderId, paymentMethod, onSuccess, onCancel, customerName }: QRPaymentProps) {
  const [isGenerating, setIsGenerating] = useState(true);
  const [qrCode, setQrCode] = useState<string>('');
  const [status, setStatus] = useState<'generating' | 'waiting' | 'processing' | 'success' | 'failed'>('generating');
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [isExpired, setIsExpired] = useState(false);

  const provider = paymentProviders.find(p => p.id === paymentMethod);

  useEffect(() => {
    // Generate QR code
    const generateQR = async () => {
      setIsGenerating(true);
      setStatus('generating');
      
      // Simulate QR generation
      setTimeout(() => {
        const qrData = {
          amount,
          orderId,
          merchant: 'Reweave Batik',
          timestamp: Date.now(),
          expiry: Date.now() + 300000, // 5 minutes
          provider: paymentMethod
        };
        
        // Generate mock QR code string
        const mockQR = `QR_${orderId}_${amount}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setQrCode(mockQR);
        setStatus('waiting');
        setIsGenerating(false);
      }, 2000);
    };

    generateQR();
  }, [amount, orderId, paymentMethod]);

  useEffect(() => {
    // Countdown timer
    if (status === 'waiting' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && status === 'waiting') {
      setIsExpired(true);
      setStatus('failed');
    }
  }, [countdown, status]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePaymentSuccess = () => {
    setStatus('processing');
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }, 1500);
  };

  const handleRetry = () => {
    setCountdown(300);
    setIsExpired(false);
    setStatus('generating');
    // Regenerate QR
    setTimeout(() => {
      const newQR = `QR_${orderId}_${amount}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setQrCode(newQR);
      setStatus('waiting');
    }, 1000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Reweave Payment',
          text: `Payment of RM ${amount.toFixed(2)} for order ${orderId}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(qrCode);
      alert('Payment details copied to clipboard!');
    }
  };

  const handleDownload = () => {
    // Create a canvas with the QR code
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 500;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header
    ctx.fillStyle = provider?.color || '#1A2741';
    ctx.fillRect(0, 0, canvas.width, 80);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Reweave Payment', canvas.width / 2, 50);

    // QR Code placeholder
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(50, 120, 300, 300);
    
    // QR Pattern (simplified)
    ctx.fillStyle = '#1A2741';
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 20; j++) {
        if (Math.random() > 0.5) {
          ctx.fillRect(60 + i * 14, 130 + j * 14, 12, 12);
        }
      }
    }

    // Amount
    ctx.fillStyle = '#1A2741';
    ctx.font = 'bold 32px Arial';
    ctx.fillText(`RM ${amount.toFixed(2)}`, canvas.width / 2, 460);

    // Download
    const link = document.createElement('a');
    link.download = `payment-${orderId}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  if (status === 'generating') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-strong">
          <div className="w-20 h-20 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <QrCode className="w-10 h-10 text-sage animate-pulse" />
          </div>
          <h3 className="text-xl font-display font-bold text-indigo mb-2">Generating QR Code</h3>
          <p className="text-pebble mb-6">Please wait while we create your payment QR code...</p>
          <div className="w-full bg-sand rounded-full h-2">
            <div className="bg-sage h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-strong">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h3 className="text-xl font-display font-bold text-indigo mb-2">Payment Successful!</h3>
          <p className="text-pebble mb-6">Thank you for your purchase, {customerName}!</p>
          <div className="bg-sand/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-pebble">Amount Paid</p>
            <p className="text-3xl font-bold text-indigo">RM {amount.toFixed(2)}</p>
            <p className="text-xs text-pebble mt-2">Order ID: {orderId}</p>
          </div>
          <div className="space-y-3">
            <button onClick={handleDownload} className="w-full btn btn-outline">
              <Download className="w-4 h-4 mr-2" />
              Download Receipt
            </button>
            <button onClick={onSuccess} className="w-full btn btn-primary">
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-strong">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-xl font-display font-bold text-indigo mb-2">
            {isExpired ? 'Payment Expired' : 'Payment Failed'}
          </h3>
          <p className="text-pebble mb-6">
            {isExpired 
              ? 'The QR code has expired. Please generate a new one to complete your payment.'
              : 'There was an issue processing your payment. Please try again.'
            }
          </p>
          <div className="space-y-3">
            <button onClick={handleRetry} className="w-full btn btn-primary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate New QR Code
            </button>
            <button onClick={onCancel} className="w-full btn btn-outline">
              Cancel Payment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-strong">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-display font-bold text-indigo">Complete Payment</h3>
          <button onClick={onCancel} className="text-pebble hover:text-indigo">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Payment Info */}
        <div className="bg-sand/20 rounded-xl p-4 mb-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className={`w-10 h-10 ${provider?.color} rounded-lg flex items-center justify-center text-white`}>
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-indigo">{provider?.name}</p>
              <p className="text-sm text-pebble">{provider?.processingTime}</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-pebble">Amount to Pay</p>
            <p className="text-3xl font-bold text-indigo">RM {amount.toFixed(2)}</p>
            <p className="text-xs text-pebble mt-2">Order: {orderId}</p>
          </div>
        </div>

        {/* QR Code */}
        <div className="text-center mb-6">
          <div className="w-48 h-48 bg-sand/30 rounded-2xl mx-auto mb-4 flex items-center justify-center relative">
            <div className="absolute inset-4 border-4 border-sage rounded-xl">
              <div className="w-full h-full bg-white rounded-lg flex items-center justify-center">
                <QrCode className="w-24 h-24 text-indigo" />
              </div>
            </div>
            <div className="absolute top-2 right-2 bg-sage text-white text-xs px-2 py-1 rounded">
              {formatTime(countdown)}
            </div>
          </div>
          <p className="text-sm text-pebble">Scan this QR code with your {provider?.name} app</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button 
            onClick={handlePaymentSuccess}
            className="w-full btn btn-primary"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark as Paid (Demo)
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handleShare} className="btn btn-outline text-sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </button>
            <button onClick={handleDownload} className="btn btn-outline text-sm">
              <Download className="w-4 h-4 mr-2" />
              Save QR
            </button>
          </div>
          <button onClick={onCancel} className="w-full text-pebble hover:text-indigo text-sm">
            Cancel Payment
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-sage/10 rounded-xl">
          <p className="text-xs text-sage font-medium mb-2">Payment Instructions:</p>
          <ol className="text-xs text-pebble space-y-1 list-decimal list-inside">
            <li>Open your {provider?.name} app</li>
            <li>Tap the scan/QR code button</li>
            <li>Scan the QR code above</li>
            <li>Confirm the payment amount</li>
            <li>Complete the payment</li>
          </ol>
        </div>
      </div>
    </div>
  );
}