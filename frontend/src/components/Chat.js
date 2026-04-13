import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ChatList from './ChatList';
import ChatScreen from './ChatScreen';
import SideDrawer from './SideDrawer';

const Chat = () => {
  const { user } = useAuth();
  const [fetchAgain, setFetchAgain] = useState(false);
  const [selectedChat, setSelectedChat] = useState();

  return (
    <div className="h-screen w-screen bg-[#0f172a] text-slate-200 flex flex-col overflow-hidden">
      {user && <SideDrawer selectedChat={selectedChat} />}
      <div className="flex-1 flex overflow-hidden w-full bg-[#1e293b]/50">
        {user && (
          <>
            {/* Chat List - Left sidebar */}
            <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-[400px] flex-shrink-0 border-r border-slate-700/50`}>
              <ChatList fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} selectedChat={selectedChat} setSelectedChat={setSelectedChat} />
            </div>
            {/* Chat Screen - Full right side */}
            <div className={`${selectedChat ? 'flex' : 'hidden md:flex'} flex-1 min-w-0`}>
              <ChatScreen fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} selectedChat={selectedChat} setSelectedChat={setSelectedChat} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;
