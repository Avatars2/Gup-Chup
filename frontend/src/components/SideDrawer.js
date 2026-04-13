import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, Settings, LogOut, Menu, X, MessageCircle, User } from 'lucide-react';
import UserProfile from './UserProfile';
import toast from 'react-hot-toast';

const SideDrawer = ({ selectedChat }) => {
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [profileModal, setProfileModal] = useState(false);
  
  const { user, logout, api, socket } = useAuth();

  const handleSearch = async () => {
    if (!search) {
      toast.error('Please enter something in search');
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await api.get(`/user?search=${search}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      setLoading(false);
      toast.error('Failed to load search results');
    }
  };

  const accessChat = async (userId) => {
    try {
      const config = {
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };
      await api.post('/chat', { userId }, config);
      setOpen(false);
      setSearchResult([]);
      setSearch('');
    } catch (error) {
      toast.error('Error fetching the chat');
    }
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <div className={`${selectedChat ? 'hidden md:block' : 'block'} bg-[#1e293b]/80 backdrop-blur-xl border-b border-slate-700/50 shadow-sm transition-all duration-300`}>
        <div className="flex items-center justify-between px-4 md:px-8 lg:px-10 py-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight italic">Gup Chup</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setProfileModal(true)}
              className="p-2 hover:bg-slate-800 rounded-lg transition duration-200"
            >
              <Settings className="w-5 h-5 text-slate-400 hover:text-white" />
            </button>
            <div className="relative group">
              <button
                onClick={logout}
                className="p-2 hover:bg-red-500/10 rounded-lg transition duration-200 group"
              >
                <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Side Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
            onClick={() => setOpen(false)}
          ></div>
          <div className="relative bg-[#0f172a] w-80 h-full shadow-2xl transform transition-transform border-r border-slate-700/50">
            <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-[#1e293b]">
              <h2 className="text-lg font-semibold text-slate-200">Search Users</h2>
              <button
                onClick={() => setOpen(false)}
                className="p-1 hover:bg-slate-700 rounded-lg transition duration-200"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-4">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or mobile number"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-[#1e293b] text-slate-200"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition duration-200 shadow-lg"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3 p-3 animate-pulse">
                        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-300 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  searchResult?.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => accessChat(user._id)}
                      className="flex items-center space-x-3 p-3 hover:bg-[#1e293b] rounded-xl cursor-pointer transition duration-200 group"
                    >
                      <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-md group-hover:shadow-lg transition-shadow">
                        {user.pic ? (
                          <img src={user.pic} alt={user.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">{user.name}</p>
                        <p className="text-sm text-slate-400">{user.mobile}</p>
                      </div>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {profileModal && (
        <UserProfile onClose={() => setProfileModal(false)} />
      )}
    </>
  );
};

export default SideDrawer;
