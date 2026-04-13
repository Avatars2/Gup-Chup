import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Send, Phone, Video, MoreVertical, Paperclip, Mic, Search, MessageCircle, Edit2, XCircle } from 'lucide-react';
import ScrollableChat from './ScrollableChat';
import { getSenderFull } from '../config/ChatLogics';
import toast from 'react-hot-toast';
import MessageSearch from './MessageSearch';
import { encryptMessage, decryptMessage } from '../config/encryptionLogics';

const ChatScreen = ({ fetchAgain, setFetchAgain, selectedChat, setSelectedChat }) => {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = React.useRef(null);
  const audioChunksRef = React.useRef([]);
  const timerIntervalRef = React.useRef(null);
  const fileInputRef = React.useRef(null);

  const { user, api, socket } = useAuth();

  const handleSearch = useCallback((searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredMessages(messages);
      return;
    }

    const filtered = messages.filter((message) =>
      message.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMessages(filtered);
  }, [messages]);

  const toggleSearch = () => {
    setIsSearching(!isSearching);
    if (isSearching) {
      setFilteredMessages(messages);
    }
  };

  const fetchMessages = useCallback(async () => {
    if (!selectedChat) return;

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      console.log('Fetching messages for chat:', selectedChat._id);
      const { data } = await api.get(`/message/${selectedChat._id}`, config);
      
      // Decrypt messages locally
      const decryptedData = data.map(msg => ({
        ...msg,
        content: msg.content ? decryptMessage(msg.content, selectedChat._id) : msg.content
      }));
      
      console.log('Messages received and decrypted:', decryptedData);
      setMessages(decryptedData);
      setLoading(false);
      socket?.emit('join chat', selectedChat._id);
      
      // Notify sender that messages are read
      socket?.emit("message read", { chatId: selectedChat._id, userId: user._id });
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
      toast.error(error.response?.data?.message || 'Failed to load messages');
    }
  }, [selectedChat, user.token, api, socket]);

  useEffect(() => {
    socket?.on('connected', () => setSocketConnected(true));
    socket?.on('typing', () => setIsTyping(true));
    socket?.on('stop typing', () => setIsTyping(false));
    
    // Listen for incoming messages
    socket?.on('message recieved', (newMessageRecieved) => {
      console.log('New message received via socket:', newMessageRecieved);
      
      const decryptedMessage = {
        ...newMessageRecieved,
        content: decryptMessage(newMessageRecieved.content, newMessageRecieved.chat._id)
      };

      if (!selectedChat || selectedChat._id !== newMessageRecieved.chat._id) {
        toast.success(`New message from ${newMessageRecieved.sender.name}`);
      } else {
        setMessages((prevMessages) => [...prevMessages, decryptedMessage]);
        // Emit read event if we are in this chat
        socket.emit("message read", { chatId: selectedChat._id, userId: user._id });
        api.post('/message/markAsRead', { chatId: selectedChat._id });
      }
    });

    socket?.on('read update', ({ chatId, userId }) => {
      console.log('Read update received:', chatId, userId);
      if (selectedChat && selectedChat._id === chatId) {
        setMessages((prev) => 
          prev.map((msg) => {
            const isAlreadyRead = msg.readBy.some(u => (u._id || u) === userId);
            if (!isAlreadyRead) {
              return { ...msg, readBy: [...msg.readBy, { _id: userId }] };
            }
            return msg;
          })
        );
      }
    });
    
    return () => {
      socket?.off('connected');
      socket?.off('typing');
      socket?.off('stop typing');
      socket?.off('message recieved');
      socket?.off('read update');
    };
  }, [socket, selectedChat, user._id, api]);

  useEffect(() => {
    if (!socket) return;

    socket.on("message updated", (updatedMessage) => {
      console.log('Message updated via socket:', updatedMessage);
      if (selectedChat && selectedChat._id === updatedMessage.chat._id) {
        setMessages((prev) => 
          prev.map((m) => m._id === updatedMessage._id ? {
            ...updatedMessage,
            content: decryptMessage(updatedMessage.content, updatedMessage.chat._id)
          } : m)
        );
      }
    });

    socket.on("message deleted", ({ _id, chatId }) => {
      console.log('Message deleted via socket:', _id);
      if (selectedChat && selectedChat._id === chatId) {
        setMessages((prev) => 
          prev.map((m) => m._id === _id ? { ...m, content: "🚫 This message was deleted", isDeleted: true, fileUrl: null } : m)
        );
      }
    });

    return () => {
      socket.off("message updated");
      socket.off("message deleted");
    };
  }, [socket, selectedChat]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    setFilteredMessages(messages);
  }, [messages]);

  const sendMessage = async (event) => {
    if ((event.key === 'Enter' || event.type === 'click') && (newMessage.trim() || event.fileData)) {
      socket?.emit('stop typing', selectedChat._id);
      try {
        const config = {
          headers: {
            'Content-type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
        };
        const messageContent = newMessage;
        const fileData = event.fileData || {};
        
        // Encrypt the message content before sending
        const encryptedContent = encryptMessage(messageContent, selectedChat._id);
        
        if (editingMessage) {
          // Handle Edit
          const { data } = await api.put('/message/edit', {
            messageId: editingMessage._id,
            content: encryptedContent,
          }, config);
          
          const decrypted = { ...data, content: messageContent };
          setMessages((prev) => prev.map((m) => m._id === data._id ? decrypted : m));
          socket?.emit('message edit', data);
          setEditingMessage(null);
          setNewMessage('');
          return;
        }

        setNewMessage('');
        console.log('Sending encrypted message to chat:', selectedChat._id);
        const { data } = await api.post(
          '/message',
          {
            content: encryptedContent,
            chatId: selectedChat._id,
            fileUrl: fileData.url,
            fileType: fileData.fileType,
            fileName: fileData.filename,
          },
          config
        );
        
        // Decrypt the returned message for local display
        const decryptedMessage = {
          ...data,
          content: decryptMessage(data.content, selectedChat._id)
        };
        
        console.log('Message sent successfully:', data);
        socket?.emit('new message', data);
        setMessages((prevMessages) => [...prevMessages, decryptedMessage]);
      } catch (error) {
        console.error('Error sending/editing message:', error);
        toast.error(error.response?.data?.message || 'Failed to process message');
        if (editingMessage) setEditingMessage(null);
      }
    }
  };

  const handleEditMessage = (message) => {
    setEditingMessage(message);
    setNewMessage(message.content);
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Are you sure you want to delete this message for everyone?")) return;
    
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      
      const { data } = await api.post('/message/delete', { messageId }, config);
      
      // Update local state
      setMessages((prev) => 
        prev.map((m) => m._id === messageId ? { ...m, content: "🚫 This message was deleted", isDeleted: true, fileUrl: null } : m)
      );
      
      socket?.emit('message delete', data);
      toast.success('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size should be less than 10MB');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await api.post('/upload', formData, config);
      
      // Auto-send the message once uploaded
      await sendMessage({ type: 'click', fileData: data });
      
      toast.success('File uploaded and sent');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(error.response?.data?.error || 'Failed to upload file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], `voice_message_${Date.now()}.webm`, { type: 'audio/webm' });
        
        // Upload the recorded audio
        await uploadVoiceMessage(file);
        
        // Stop all tracks in the stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingDuration(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerIntervalRef.current);
    }
  };

  const uploadVoiceMessage = async (file) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await api.post('/upload', formData, config);
      
      // Send as audio message
      await sendMessage({ type: 'click', fileData: { ...data, fileType: 'audio' } });
      
    } catch (error) {
      console.error('Error uploading voice message:', error);
      toast.error('Failed to send voice message');
    } finally {
      setIsUploading(false);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket?.emit('typing', selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket?.emit('stop typing', selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  if (!selectedChat) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-[#0f172a]/95 relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat">
         {/* Overlay to ensure readability and depth */}
        <div className="absolute inset-0 bg-[#0f172a]/90 pointer-events-none"></div>
        
        {/* Desktop Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 text-center w-full max-w-2xl px-8 py-12 animate-in fade-in zoom-in duration-1000">
          <div className="relative inline-block mb-10">
            <div className="absolute inset-0 bg-indigo-500/30 blur-3xl rounded-full scale-150 animate-pulse"></div>
            <div className="relative w-40 h-40 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[3rem] flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10 group hover:scale-105 transition-transform duration-500">
              <MessageCircle className="w-20 h-20 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
            </div>
          </div>
          <h3 className="text-5xl font-extrabold text-white mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500">
            Your Messages
          </h3>
          <p className="text-slate-400 text-lg max-w-sm mx-auto leading-relaxed font-medium">
            Send private photos, documents and messages to a friend or group.
          </p>
          <div className="mt-12 inline-flex items-center px-8 py-3 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold uppercase tracking-[0.2em] shadow-lg backdrop-blur-md">
            Select a chat to start
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-[#0f172a]/95 relative transition-all">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#1e293b]/80 backdrop-blur-xl border-b border-slate-700/50 z-10">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSelectedChat('')}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all md:hidden"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3 cursor-pointer group">
            <div className="relative">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold shadow-inner ring-2 ring-indigo-500/30 overflow-hidden group-hover:ring-indigo-400 transition-all">
                {!selectedChat.isGroupChat ? (
                        (() => {
                          const sender = getSenderFull(user, selectedChat.users);
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
                            sender.name[0]?.toUpperCase() || '?'
                          );
                        })()
                      ) : (
                        selectedChat.chatName[0]?.toUpperCase() || '?'
                      )}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 md:w-3.5 md:h-3.5 bg-emerald-400 rounded-full border-2 border-[#1e293b]"></span>
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-100 text-base md:text-lg truncate tracking-tight">
                {!selectedChat.isGroupChat
                  ? getSenderFull(user, selectedChat.users).name
                  : selectedChat.chatName}
              </h3>
              <div className="flex items-center space-x-2">
                {isTyping ? (
                  <p className="text-xs text-indigo-400 flex items-center font-medium animate-pulse">typing...</p>
                ) : (
                  <>
                    {!selectedChat.isGroupChat && (
                      <p className={`text-[10px] md:text-xs font-medium ${getSenderFull(user, selectedChat.users).isOnline ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {getSenderFull(user, selectedChat.users).isOnline ? 'Online' : 'Offline'}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={toggleSearch}
            className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-700/50 rounded-xl transition-all hidden md:block"
            title="Search messages"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto relative w-full px-4 py-4 md:px-8 lg:px-12 xl:px-16 styled-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat shadow-inner flex flex-col justify-end">
        <div className="absolute inset-0 bg-[#0f172a]/95 pointer-events-none"></div>
        {isSearching && (
          <div className="relative z-20 mb-4">
             <MessageSearch onSearch={handleSearch} onClose={toggleSearch} />
          </div>
        )}
        <div className="relative z-10 w-full h-full flex flex-col justify-end">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center space-y-4">
                <div className="rounded-full h-12 w-12 border-2 border-indigo-500 border-t-transparent animate-spin"></div>
              </div>
            </div>
          ) : (
            <ScrollableChat 
              messages={filteredMessages} 
              onEditMessage={handleEditMessage}
              onDeleteMessage={handleDeleteMessage}
            />
          )}
        </div>
      </div>

      {/* Message Input Area */}
      <div className="px-4 py-4 md:px-8 md:py-6 bg-[#1e293b]/80 backdrop-blur-xl border-t border-slate-700/50 z-10">
        <div className="flex items-center space-x-2 md:space-x-4 max-w-4xl mx-auto">
          <button
            className={`p-2 sm:p-3 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-full transition-all ${isUploading ? 'animate-pulse' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Paperclip className="w-6 h-6" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,video/*,.pdf,.doc,.docx,.txt,.xlsx,.pptx"
          />
          
          <div className="flex-1 relative">
            {editingMessage && (
              <div className="absolute -top-10 left-0 right-0 bg-indigo-600/90 text-white text-[10px] px-4 py-1.5 rounded-t-xl flex justify-between items-center backdrop-blur-sm shadow-lg ring-1 ring-white/10">
                <span className="font-semibold uppercase tracking-wider flex items-center italic">
                  <Edit2 className="w-3 h-3 mr-1.5" /> Editing Message
                </span>
                <button 
                  onClick={() => {
                    setEditingMessage(null);
                    setNewMessage('');
                  }}
                  className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            )}
            <input
              type="text"
              value={newMessage}
              onChange={typingHandler}
              onKeyPress={sendMessage}
              placeholder={editingMessage ? "Edit your message..." : "Type your message..."}
              className={`w-full px-6 py-3.5 bg-[#0f172a] text-slate-200 border ${
                editingMessage ? 'border-indigo-500 ring-1 ring-indigo-500/30' : 'border-slate-700/50'
              } rounded-full focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm placeholder:text-slate-500 shadow-inner`}
            />
          </div>
          
          {newMessage.trim() || isRecording ? (
            <div className="flex items-center space-x-2">
              {isRecording && (
                <div className="flex items-center bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20 mr-2 animate-pulse">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-red-400 text-xs font-bold tabular-nums">{formatDuration(recordingDuration)}</span>
                </div>
              )}
              <button
                onClick={isRecording ? stopRecording : () => sendMessage({ key: 'Enter' })}
                className={`p-3 ${isRecording ? 'bg-red-600 animate-bounce' : 'bg-indigo-600'} text-white rounded-full hover:opacity-90 transition-all transform hover:scale-105 active:scale-95 shadow-lg`}
              >
                {isRecording ? <Send className="w-5 h-5" /> : <Send className="w-5 h-5 ml-1" />}
              </button>
            </div>
          ) : (
            <button 
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all bg-[#0f172a] border border-slate-700/50 group active:bg-indigo-600 active:text-white active:scale-110"
              title="Hold to record"
            >
              <Mic className="w-5 h-5 group-active:animate-pulse" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
