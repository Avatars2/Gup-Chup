import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, MoreVertical, Archive } from 'lucide-react';
import ChatLoading from './ChatLoading';
import UserListItem from './UserListItem';
import GroupChat from './GroupChat';
import { getSenderFull } from '../config/ChatLogics';
import toast from 'react-hot-toast';
import ThemeToggle from './ThemeToggle';
import { decryptMessage } from '../config/encryptionLogics';

const ChatList = ({ fetchAgain, setFetchAgain, selectedChat, setSelectedChat }) => {
  const [loggedUser, setLoggedUser] = useState();
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [groupChatModal, setGroupChatModal] = useState(false);
  
  const { user, socket, api } = useAuth();
  const [chats, setChats] = useState([]);

  const fetchChats = useCallback(async () => {
    try {
      console.log('Fetching chats...');
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await api.get('/chat', config);
      console.log('Chats received:', data);
      setChats(data);
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast.error(error.response?.data?.message || 'Failed to load chats');
    }
  }, [user.token, api]);

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem('userInfo')));
    fetchChats();
  }, [fetchAgain, fetchChats]);

  useEffect(() => {
    if (!socket) return;
    
    socket.on("user status change", ({ userId, isOnline }) => {
      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (!chat.isGroupChat) {
            const updatedUsers = chat.users.map((u) =>
              u._id === userId ? { ...u, isOnline } : u
            );
            return { ...chat, users: updatedUsers };
          }
          return chat;
        })
      );
    });

    socket.on("message recieved", (newMessageRecieved) => {
      setChats((prevChats) => {
        const existingChatIndex = prevChats.findIndex((c) => c._id === newMessageRecieved.chat._id);
        
        // Decrypt the content for the preview
        const decryptedMessage = {
          ...newMessageRecieved,
          content: decryptMessage(newMessageRecieved.content, newMessageRecieved.chat._id)
        };

        if (existingChatIndex !== -1) {
          const updatedChats = [...prevChats];
          const updatedChat = { ...updatedChats[existingChatIndex], latestMessage: decryptedMessage };
          updatedChats.splice(existingChatIndex, 1);
          return [updatedChat, ...updatedChats];
        } else {
          // If chat not in list (rare for one-on-one but possible for new group), we might need to fetch
          setFetchAgain(prev => !prev);
          return prevChats;
        }
      });
    });

    socket.on("read update", ({ chatId, userId }) => {
      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat._id === chatId && chat.latestMessage) {
            const isAlreadyRead = chat.latestMessage.readBy.some(u => (u._id || u) === userId);
            if (!isAlreadyRead) {
              return {
                ...chat,
                latestMessage: {
                  ...chat.latestMessage,
                  readBy: [...chat.latestMessage.readBy, userId]
                }
              };
            }
          }
          return chat;
        })
      );
    });

    socket.on("message updated", (updatedMessage) => {
      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat._id === updatedMessage.chat._id) {
            return {
              ...chat,
              latestMessage: {
                ...updatedMessage,
                content: decryptMessage(updatedMessage.content, updatedMessage.chat._id)
              }
            };
          }
          return chat;
        })
      );
    });

    socket.on("message deleted", ({ _id, chatId }) => {
      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat._id === chatId && chat.latestMessage && chat.latestMessage._id === _id) {
            return {
              ...chat,
              latestMessage: {
                ...chat.latestMessage,
                content: "🚫 This message was deleted",
                isDeleted: true
              }
            };
          }
          return chat;
        })
      );
    });

    return () => {
      socket.off("user status change");
      socket.off("message recieved");
      socket.off("read update");
      socket.off("message updated");
      socket.off("message deleted");
    };
  }, [socket, setFetchAgain]);

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
      console.log('Accessing chat with user:', userId);
      const config = {
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await api.post('/chat', { userId }, config);

      if (!chats.find((c) => c._id === data._id)) {
        setChats([data, ...chats]);
      }
      setSelectedChat(data);
      setSearchResult([]);
      setSearch('');
      console.log('Chat accessed successfully:', data);
    } catch (error) {
      console.error('Error accessing chat:', error);
      toast.error(error.response?.data?.message || 'Error fetching the chat');
    }
  };

  return (
    <div className="h-full bg-transparent flex flex-col overflow-hidden w-full transition-all">
      {/* Header Profile Area */}
      <div className="px-4 py-5 flex items-center justify-between border-b border-slate-700/50 bg-[#1e293b]/50 backdrop-blur-md">
        <div className="flex items-center space-x-3 cursor-pointer group">
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-indigo-500/20 flex items-center justify-center font-bold text-lg text-indigo-400 ring-2 ring-indigo-500/30 overflow-hidden shadow-inner group-hover:ring-indigo-400 transition-all">
              {user?.pic ? (
                <img
                  src={user?.pic || ""}
                  alt={user?.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<span>' + (user?.name?.[0]?.toUpperCase() || 'C') + '</span>';
                  }}
                />
              ) : (
                user?.name?.[0]?.toUpperCase() || 'C'
              )}
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#1e293b]"></span>
          </div>
          <div>
            <h2 className="font-semibold text-slate-200 text-sm">{user?.name || 'User'}</h2>
            <p className="text-[11px] text-emerald-400 font-medium">Online</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setGroupChatModal(true)}
            className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800/50 rounded-lg transition-all"
            title="Create Group Chat"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Global Search Box */}
      <div className="px-4 py-4 bg-[#1e293b]/30">
        <div className="relative w-full">
          <div className="relative group">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#0f172a]/60 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-slate-200 placeholder:text-slate-500 text-sm transition-all"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          {/* Global Search Results Dropdown */}
          {searchResult?.length > 0 && (
            <div className="mt-2 max-h-60 overflow-y-auto bg-[#1e293b] rounded-xl shadow-2xl border border-slate-700 absolute top-full left-0 z-50 w-full">
              {loading ? (
                <ChatLoading />
              ) : (
                searchResult.map((user) => (
                  <div className="hover:bg-slate-800 transition-colors" key={user._id}>
                   <UserListItem
                     user={user}
                     handleFunction={() => accessChat(user._id)}
                   />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Active Chats List */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 styled-scrollbar">
        <div className="px-2 pb-2">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Recent Messages</h3>
        </div>
        {chats ? (
          chats.map((chat) => (
            <div
              key={chat._id}
              onClick={() => setSelectedChat(chat)}
              className={`group flex items-center p-3 mb-1 rounded-xl cursor-pointer transition-all ${
                selectedChat === chat
                  ? 'bg-indigo-600/10 border-l-2 border-indigo-500'
                  : 'hover:bg-slate-800/50 border-l-2 border-transparent'
              }`}
            >
              <div className="relative mr-3 flex-shrink-0">
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-slate-300 bg-slate-800 overflow-hidden shadow-sm">
                  {!chat.isGroupChat ? (
                    (() => {
                      const sender = getSenderFull(loggedUser, chat.users);
                      return sender.pic ? (
                        <img
                          src={sender.pic}
                          alt={sender.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                          {sender.name[0]?.toUpperCase() || '?'}
                        </div>
                      );
                    })()
                  ) : (
                    <div className="w-full h-full bg-slate-700 flex items-center justify-center text-emerald-400 border border-slate-600">
                      {chat.chatName[0]?.toUpperCase() || 'G'}
                    </div>
                  )}
                </div>
                {/* Status Indicator (Mocked online state for style) */}
                {!chat.isGroupChat && selectedChat !== chat && (
                   <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#1e293b]"></span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className={`font-semibold text-sm truncate ${
                    selectedChat === chat ? 'text-indigo-400' : 'text-slate-200 group-hover:text-white'
                  }`}>
                    {!chat.isGroupChat
                      ? getSenderFull(loggedUser, chat.users).name
                      : chat.chatName}
                  </p>
                  <span className={`text-[10px] ${
                    selectedChat === chat ? 'text-indigo-500/70' : 'text-slate-500'
                  }`}>
                    {chat.latestMessage ? new Date(chat.latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className={`text-xs truncate ${
                    selectedChat === chat ? 'text-slate-300' : 'text-slate-500 group-hover:text-slate-400'
                  }`}>
                    {chat.latestMessage 
                      ? (() => {
                          const decryptedText = decryptMessage(chat.latestMessage.content, chat._id);
                          return decryptedText.length > 35 ? decryptedText.substring(0, 36) + '...' : decryptedText;
                        })()
                      : 'No messages yet'}
                  </p>
                  {/* Real Unread Badge - checks if current user ID is in readBy array */}
                  {selectedChat?._id !== chat._id && 
                   chat.latestMessage && 
                   chat.latestMessage.sender._id !== loggedUser?._id && 
                   (!chat.latestMessage.readBy || !chat.latestMessage.readBy.some(u => (u._id || u) === loggedUser?._id)) && (
                     <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.6)] animate-pulse"></div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="px-4 py-8 text-center text-slate-500">
             <ChatLoading />
          </div>
        )}
      </div>

      {/* Group Chat Modal */}
      {groupChatModal && (
        <GroupChat
          onClose={() => setGroupChatModal(false)}
          setFetchAgain={setFetchAgain}
        />
      )}
    </div>
  );
};

export default ChatList;
