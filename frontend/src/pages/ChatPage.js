import React from "react";
import { ChatState } from "../context/ChatProvider";
import Sidebar from "../components/Sidebar";
import MyChats from "../components/MyChats";
import ChatBox from "../components/ChatBox";

const ChatPage = () => {
  const { user } = ChatState();

  return (
    <div className="w-full h-screen flex flex-col">
      <Sidebar /> {/* User search yahan hoga */}
      <div className="flex justify-between w-full h-[90vh] p-2">
        {user && <MyChats />} {/* Chat list (left side) */}
        {user && <ChatBox />} {/* Real-time messages (right side) */}
      </div>
    </div>
  );
};