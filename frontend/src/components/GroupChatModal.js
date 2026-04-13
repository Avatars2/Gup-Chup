import React, { useState } from "react";
import axios from "axios";
import { ChatState } from "../context/ChatProvider";

const GroupChatModal = ({ children }) => {
  const [groupChatName, setGroupChatName] = useState();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const { user, chats, setChats } = ChatState();

  // 1. User Search Logic
  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) return;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setSearchResult(data);
    } catch (error) {
      alert("Failed to Load the Search Results");
    }
  };

  // 2. Add User to Selection
  const handleGroup = (userToAdd) => {
    if (selectedUsers.includes(userToAdd)) {
      alert("User already added");
      return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  // 3. Remove User from Selection
  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
  };

  // 4. Create Group API Call
  const handleSubmit = async () => {
    if (!groupChatName || !selectedUsers) {
      alert("Please fill all the fields");
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(
        `/api/chat/group`,
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      );
      setChats([data, ...chats]); // Chat list update karein
      setIsOpen(false);
      alert("New Group Chat Created!");
    } catch (error) {
      alert("Failed to Create the Chat!");
    }
  };

  return (
    <>
      <span onClick={() => setIsOpen(true)}>{children}</span>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] p-8 rounded-3xl w-full max-w-md shadow-2xl border border-slate-700/50">
            <h2 className="text-2xl font-bold mb-6 text-center text-white tracking-tight">Create Group Chat</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Chat Name</label>
                <input
                  placeholder="Enter group name..."
                  className="w-full bg-[#0f172a]/50 border border-slate-700/50 p-3 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  onChange={(e) => setGroupChatName(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Add Members</label>
                <input
                  placeholder="Search by name or mobile..."
                  className="w-full bg-[#0f172a]/50 border border-slate-700/50 p-3 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Selected Users Chips */}
            <div className="flex flex-wrap gap-2 my-4">
              {selectedUsers.map((u) => (
                <span key={u._id} className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center shadow-sm">
                  {u.name}
                  <button className="ml-2 hover:text-indigo-200 transition-colors" onClick={() => handleDelete(u)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Search Results */}
            <div className="max-h-48 overflow-y-auto mb-6 styled-scrollbar">
              {searchResult?.slice(0, 4).map((u) => (
                <div
                  key={u._id}
                  className="p-3 bg-[#090e1a]/40 border border-slate-800/50 my-1 cursor-pointer hover:bg-indigo-600/10 hover:border-indigo-500/30 rounded-xl transition-all flex items-center justify-between group"
                  onClick={() => handleGroup(u)}
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-200 group-hover:text-indigo-400">{u.name}</p>
                    <p className="text-[10px] text-slate-500">{u.mobile}</p>
                  </div>
                  <Plus className="w-4 h-4 text-slate-600 group-hover:text-indigo-400" />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                className="px-6 py-3 text-slate-400 font-bold text-sm hover:text-white transition-colors" 
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 active:scale-95" 
                onClick={handleSubmit}
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GroupChatModal;