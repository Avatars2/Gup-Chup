import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, Shield, Zap, Image, ArrowRight, Github, Twitter, Globe } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 overflow-hidden font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-20 border-b border-slate-700/30 bg-[#0f172a]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center space-x-2 group cursor-pointer">
              <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight italic">Gup Chup</span>
            </div>
            <div className="flex items-center space-x-6">
              {user ? (
                <Link 
                  to="/chat" 
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
                >
                  Go to Chat
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-slate-300 hover:text-white font-medium transition-colors">Login</Link>
                  <Link 
                    to="/register" 
                    className="px-6 py-2.5 bg-white text-slate-900 rounded-full font-bold hover:bg-slate-100 transition-all shadow-xl"
                  >
                    Join Now
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-16 md:pt-32 md:pb-32 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span>The easiest way to connect</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tighter leading-tight animate-in fade-in slide-in-from-bottom-6 duration-1000 uppercase">
            Simple. Personal. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 italic lowercase">Secure Messaging.</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Connect with your friends and family instantly. 
            Share your moments, send documents, and enjoy private conversations in a beautiful, distraction-free environment.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            {user ? (
              <Link 
                to="/chat" 
                className="group px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-500 transition-all flex items-center shadow-2xl shadow-indigo-500/30"
              >
                Continue to Chat
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link 
                  to="/register" 
                  className="group px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-500 transition-all flex items-center shadow-2xl shadow-indigo-500/30"
                >
                  Start Chatting Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  to="/login" 
                  className="px-8 py-4 bg-slate-800 text-white rounded-2xl font-bold text-lg hover:bg-slate-700 transition-all border border-slate-700"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-24 bg-slate-900/40 border-t border-slate-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="w-8 h-8 text-yellow-400" />}
              title="Instant Delivery"
              description="No more waiting. Your messages reach your friends instantly, keeping you connected in real-time without missing a beat."
            />
            <FeatureCard 
              icon={<Shield className="w-8 h-8 text-emerald-400" />}
              title="Built-in Privacy"
              description="Your conversations are protected and private. We ensure that only you and the person you're chatting with can read your messages."
            />
            <FeatureCard 
              icon={<Image className="w-8 h-8 text-indigo-400" />}
              title="Share Everything"
              description="From favorite photos to important documents and videos, share your media quickly and easily with everyone in your circle."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-slate-700/30 bg-[#0f172a]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white italic">Gup Chup</span>
          </div>
          <p className="text-slate-500 text-sm mb-8">© 2026 Gup Chup. All rights reserved. Created with passion for privacy.</p>
          <div className="flex justify-center space-x-6 text-slate-400">
            <Twitter className="w-5 h-5 cursor-pointer hover:text-indigo-400 transition-all" />
            <Github className="w-5 h-5 cursor-pointer hover:text-white transition-all" />
            <Globe className="w-5 h-5 cursor-pointer hover:text-indigo-400 transition-all" />
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="p-8 bg-[#1e293b]/40 backdrop-blur-md rounded-[2rem] border border-slate-700/50 hover:border-indigo-500/50 transition-all group">
    <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
      {icon}
    </div>
    <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
    <p className="text-slate-400 leading-relaxed text-sm">
      {description}
    </p>
  </div>
);

export default Home;
