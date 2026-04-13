import React from 'react';
import { User, MessageCircle } from 'lucide-react';

const UserListItem = ({ user, handleFunction }) => {
  return (
    <div
      onClick={handleFunction}
      className="flex items-center space-x-3 p-3 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 rounded-xl cursor-pointer transition-all duration-200 group"
    >
      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md group-hover:shadow-lg transition-shadow">
        {user.pic ? (
          <img 
            src={user.pic} 
            alt={user.name} 
            className="w-full h-full rounded-full object-cover" 
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user w-6 h-6"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
            }}
          />
        ) : (
          <User className="w-6 h-6" />
        )}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">{user.name}</p>
        <p className="text-sm text-gray-500">{user.mobile}</p>
      </div>
      <div className="flex items-center space-x-2">
        {user.isOnline && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
        <MessageCircle className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
      </div>
    </div>
  );
};

export default UserListItem;
