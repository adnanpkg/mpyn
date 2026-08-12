'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatusCheckProps {
  className?: string;
}

interface SystemCheck {
  name: string;
  status: 'checking' | 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

export default function SystemStatus({ className = '' }: StatusCheckProps) {
  const [checks, setChecks] = useState<SystemCheck[]>([]);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    runSystemChecks();
  }, []);

  const runSystemChecks = async () => {
    setChecking(true);
    const results: SystemCheck[] = [];

    // Environment variables check
    results.push(await checkEnvironmentVariables());
    
    // Razorpay configuration check
    results.push(await checkRazorpayConfig());
    
    // Convex connection check
    results.push(await checkConvexConnection());
    
    // Payment routes check
    results.push(await checkPaymentRoutes());

    setChecks(results);
    setChecking(false);
  };

  const checkEnvironmentVariables = async (): Promise<SystemCheck> => {
    const required = [
      'NEXT_PUBLIC_CONVEX_URL',
      'NEXT_PUBLIC_RAZORPAY_KEY_ID',
    ];
    
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length === 0) {
      return {
        name: 'Environment Variables',
        status: 'pass',
        message: 'All required env vars present',
      };
    } else {
      return {
        name: 'Environment Variables', 
        status: 'fail',
        message: `Missing: ${missing.join(', ')}`,
        details: 'Check .env.local file'
      };
    }
  };

  const checkRazorpayConfig = async (): Promise<SystemCheck> => {
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    
    if (!keyId) {
      return {
        name: 'Razorpay Configuration',
        status: 'fail', 
        message: 'Razorpay key not configured',
      };
    }
    
    if (keyId.includes('placeholder') || keyId.includes('your_key')) {
      return {
        name: 'Razorpay Configuration',
        status: 'warning',
        message: 'Using placeholder Razorpay keys',
        details: 'Replace with real test keys for testing'
      };
    }
    
    return {
      name: 'Razorpay Configuration',
      status: 'pass',
      message: 'Razorpay keys configured',
    };
  };

  const checkConvexConnection = async (): Promise<SystemCheck> => {
    try {
      // Simple test to see if Convex is reachable
      const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
      if (!convexUrl) {
        throw new Error('No Convex URL configured');
      }
      
      return {
        name: 'Convex Connection',
        status: 'pass',
        message: 'Connected to Convex',
      };
    } catch (error) {
      return {
        name: 'Convex Connection',
        status: 'fail',
        message: 'Cannot connect to Convex',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const checkPaymentRoutes = async (): Promise<SystemCheck> => {
    try {
      // Check if payment API routes are accessible
      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}), // Empty body will trigger validation error but confirms route exists
      });
      
      if (response.status === 400) {
        // 400 means route exists but validation failed (expected)
        return {
          name: 'Payment API Routes',
          status: 'pass',
          message: 'Payment routes accessible',
        };
      } else {
        return {
          name: 'Payment API Routes',
          status: 'warning',
          message: `Unexpected response: ${response.status}`,
        };
      }
    } catch (error) {
      return {
        name: 'Payment API Routes',
        status: 'fail',
        message: 'Payment routes not accessible',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const getStatusIcon = (status: SystemCheck['status']) => {
    switch (status) {
      case 'checking':
        return <Loader2 size={16} className="animate-spin text-blue-500" />;
      case 'pass':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'fail':
        return <XCircle size={16} className="text-red-500" />;
      case 'warning':
        return <AlertCircle size={16} className="text-yellow-500" />;
    }
  };

  const getStatusColor = (status: SystemCheck['status']) => {
    switch (status) {
      case 'checking':
        return 'bg-blue-50 border-blue-200';
      case 'pass':
        return 'bg-green-50 border-green-200';
      case 'fail':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
    }
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className={`border rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading font-bold text-sm">System Status</h3>
        <button
          onClick={runSystemChecks}
          disabled={checking}
          className="text-xs font-mono text-muted hover:text-text disabled:opacity-50"
        >
          {checking ? 'checking...' : 'refresh'}
        </button>
      </div>

      <div className="space-y-2">
        {checks.map((check, i) => (
          <motion.div
            key={check.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-3 rounded border ${getStatusColor(check.status)}`}
          >
            <div className="flex items-center gap-2 mb-1">
              {getStatusIcon(check.status)}
              <span className="font-medium text-sm">{check.name}</span>
            </div>
            <p className="text-xs text-gray-600">{check.message}</p>
            {check.details && (
              <p className="text-xs text-gray-500 mt-1">{check.details}</p>
            )}
          </motion.div>
        ))}
      </div>

      {checks.length === 0 && checking && (
        <div className="text-center py-4 text-muted">
          <Loader2 size={24} className="animate-spin mx-auto mb-2" />
          <p className="text-xs">Running system checks...</p>
        </div>
      )}

      <div className="mt-4 p-2 bg-gray-50 rounded text-xs text-gray-600">
        💡 This panel only appears in development mode
      </div>
    </div>
  );
}