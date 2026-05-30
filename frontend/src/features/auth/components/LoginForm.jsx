import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

/**
 * LoginForm component - Inspired by Main Page.jpg
 * Skill: Component Architecture & UI/UX
 */
const LoginForm = () => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(loginId, password);
  };

  return (
    <div className="flex min-h-screen bg-white font-sans">
      {/* Left Pane: Brand Splash */}
      <div className="hidden lg:flex w-1/2 bg-green-600 items-center justify-center p-12 text-white">
        <div className="max-w-md space-y-6">
          <h1 className="text-5xl font-bold leading-tight">Vast Result LMS</h1>
          <p className="text-xl text-green-100">
            Streamline your workforce management with our modern, secure, and integrated Leave Management System.
          </p>
          <div className="pt-8">
            <div className="h-1 w-20 bg-white opacity-50 rounded"></div>
          </div>
        </div>
      </div>

      {/* Right Pane: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="mt-2 text-gray-600">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {error && (
              <div className="p-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Corporate ID or Email</label>
                <input
                  type="text"
                  required
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="ad-xxxx-xxx-xx or email@example.com"
                  className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-green-500 focus:border-green-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember" type="checkbox" className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">Remember me</label>
              </div>
              <a href="#" className="text-sm font-medium text-green-600 hover:text-green-500">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or continue with</span></div>
            </div>

            <button
              type="button"
              className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-all"
            >
              <img className="h-5 w-5 mr-2" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
              Sign in with Google
            </button>
          </form>

          <p className="text-center text-sm text-gray-600">
            Don't have an account? <a href="#" className="font-medium text-green-600 hover:text-green-500">Contact HR</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
