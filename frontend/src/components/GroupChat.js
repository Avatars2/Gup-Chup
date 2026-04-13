import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Users, Search } from 'lucide-react';
import UserListItem from './UserListItem';
import toast from 'react-hot-toast';

const GroupChat = ({ onClose, setFetchAgain }) => {
  const [groupChatName, setGroupChatName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user, api } = useAuth();

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

  const handleGroup = (userToAdd) => {
    if (selectedUsers.includes(userToAdd)) {
      toast.error('User already added');
      return;
    }

    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
  };

  const handleSubmit = async () => {
    if (!groupChatName || selectedUsers.length < 2) {
      toast.error('Please fill all fields and add at least 2 users');
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      await api.post(
        '/chat/group',
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      );

      toast.success('Group chat created successfully');
      onClose();
      setFetchAgain((prev) => !prev);
    } catch (error) {
      toast.error('Failed to create group chat');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-[#1e293b] rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden border border-slate-700/50">
        {/* Header */}
        <div className="bg-[#0f172a]/50 p-6 text-white border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center tracking-tight">
              <Users className="w-5 h-5 mr-3 text-indigo-400" />
              Create Group Chat
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-xl transition duration-200"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-160px)] styled-scrollbar">
          {/* Group Name Input */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
              Group Name
            </label>
            <input
              type="text"
              value={groupChatName}
              onChange={(e) => setGroupChatName(e.target.value)}
              placeholder="Enter group name..."
              className="w-full px-4 py-3 bg-[#0f172a]/50 text-slate-200 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Search Users */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
              Add Members
            </label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by name or mobile..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#0f172a]/50 text-slate-200 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button
                onClick={handleSearch}
                className="p-3 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 rounded-xl transition-all duration-200"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Search Results */}
            {searchResult?.length > 0 && (
              <div className="mt-3 max-h-48 overflow-y-auto bg-[#090e1a]/40 border border-slate-800/50 rounded-xl p-1 styled-scrollbar">
                {loading ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-500 border-t-transparent mx-auto"></div>
                  </div>
                ) : (
                  searchResult.slice(0, 4).map((user) => (
                    <div key={user._id} className="hover:bg-indigo-600/10 rounded-lg transition-colors overflow-hidden">
                      <UserListItem
                        user={user}
                        handleFunction={() => handleGroup(user)}
                      />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
                Selected Members ({selectedUsers.length})
              </label>
              <div className="flex flex-wrap gap-2 p-1">
                {selectedUsers.map((u) => (
                  <div
                    key={u._id}
                    className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-2 shadow-sm animate-fade-in"
                  >
                    <span>{u.name}</span>
                    <button
                      onClick={() => handleDelete(u)}
                      className="hover:text-indigo-200 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-[#0f172a]/30 border-t border-slate-700/50">
          <button
            onClick={handleSubmit}
            disabled={!groupChatName || selectedUsers.length < 2}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            Create Group Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupChat;
