import React, { useState } from 'react';
import { Smile } from 'lucide-react';

const MessageReactions = ({ messageId, onReactionAdd, existingReactions = [] }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const reactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  const handleReaction = (emoji) => {
    onReactionAdd(messageId, emoji);
    setShowEmojiPicker(false);
  };

  const getReactionCount = (emoji) => {
    return existingReactions.filter(r => r.emoji === emoji).length;
  };

  const hasUserReacted = (emoji) => {
    return existingReactions.some(r => r.emoji === emoji);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
        title="Add reaction"
      >
        <Smile className="w-4 h-4" />
      </button>
      
      {showEmojiPicker && (
        <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-2 z-50">
          <div className="grid grid-cols-3 gap-1">
            {reactions.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className={`p-2 text-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors duration-200 ${
                  hasUserReacted(emoji) ? 'ring-2 ring-blue-500' : ''
                }`}
                title={`${emoji} (${getReactionCount(emoji)})`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Display existing reactions */}
      {existingReactions.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {reactions.map((emoji) => {
            const count = getReactionCount(emoji);
            if (count > 0) {
              return (
                <div
                  key={emoji}
                  className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                    hasUserReacted(emoji)
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <span>{emoji}</span>
                  <span>{count}</span>
                </div>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
};

export default MessageReactions;
