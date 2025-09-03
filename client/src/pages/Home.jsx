
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const Home = () => {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const authError = searchParams.get('error');
    if (authError === 'auth_failed') {
      setError('Authentication failed. Please try again.');
      setTimeout(() => setError(''), 5000);
    }
  }, [searchParams]);

  const handleLogin = () => {
    setError('');
    window.location.href = 'http://localhost:5000/login';
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <nav className="w-full bg-white border-b border-gray-200 py-6 px-8 flex items-center shadow-sm">
        <div className="text-3xl font-black text-slate-800 tracking-wide">Mailmate</div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16">
        <div className="max-w-4xl">
          <h1 className="text-6xl md:text-7xl font-black mb-8 text-slate-900 leading-tight">
            Welcome to <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Mailmate</span>
          </h1>
          <p className="text-2xl md:text-3xl font-bold text-slate-700 mb-4 leading-relaxed">
            Your intelligent email assistant to organize daily mails and assign priorities effortlessly.
          </p>
          <p className="text-xl md:text-2xl font-semibold text-slate-600 mb-12 leading-relaxed">
            Chat with your emails, stay productive, and never miss an important message again.
          </p>
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          <button 
            onClick={handleLogin}
            className="mt-8 px-12 py-4 bg-blue-600 text-white text-xl font-bold rounded-lg shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-300"
          >
            Login with Google
          </button>
        </div>
        
        {/* Subtle professional accent elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-10 w-72 h-72 bg-blue-50 rounded-full blur-3xl opacity-40"></div>
          <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-40"></div>
          <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-40"></div>
        </div>
      </main>
    </div>
  );
};export default Home;
