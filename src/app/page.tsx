'use client';

import { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

// Main registration page component
export default function Home() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [city, setCity] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          mobile,
          city,
          ...(showOtpInput && { otp }),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (!showOtpInput) {
          setShowOtpInput(true);
          toast.success('OTP sent to your email!');
        } else {
          toast.success('Registration successful!');
          setName('');
          setEmail('');
          setMobile('');
          setCity('');
          setOtp('');
          setShowOtpInput(false);
        }
      } else {
        throw new Error(data.error || 'Registration failed');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 text-center">
            <h2 className="text-3xl font-bold text-white">Welcome!</h2>
            <p className="mt-2 text-indigo-100">
              Join our community by registering below
            </p>
          </div>

          <div className="px-6 py-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={showOtpInput}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={showOtpInput}
                  />
                </div>

                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                    Mobile Number
                  </label>
                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter your mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    disabled={showOtpInput}
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter your city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={showOtpInput}
                  />
                </div>

                {showOtpInput && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                      OTP Verification
                    </label>
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Enter the OTP sent to your email"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </motion.div>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  {isLoading ? (
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : null}
                  {showOtpInput ? 'Verify OTP' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
