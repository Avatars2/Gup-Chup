import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ScrollableFeed from 'react-scrollable-feed';
import { Check, CheckCheck, Download, FileText, Film, MoreVertical, Edit2, Trash2, Mic } from 'lucide-react';

const BASE_URL = 'http://localhost:5000'; // Adjust if needed

const resolveFileUrl = (fileUrl) => {
  if (!fileUrl) return '';
  return fileUrl.startsWith('http') ? fileUrl : `${BASE_URL}${fileUrl}`;
};

const ImageWithTransition = ({ src, alt }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-lg bg-slate-950/70">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`max-h-64 rounded-lg object-contain bg-black/10 transition-all duration-500 ease-out ${
          loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      />
      <div
        className={`absolute inset-0 rounded-lg bg-slate-950/80 transition-opacity duration-500 ease-out ${
          loaded ? 'opacity-0' : 'opacity-100'
        }`}
      />
    </div>
  );
};

const ScrollableChat = ({ messages, onEditMessage, onDeleteMessage }) => {
  const { user } = useAuth();

  return (
    <div className="w-full h-full pt-4">
      <ScrollableFeed>
      {messages &&
        messages.map((m, i) => {
          // Add tighter margin if consecutive messages from same user
          const isConsecutive = i > 0 && messages[i - 1].sender._id === m.sender._id;
          
          return (
          <div className={`flex ${m.sender._id === user._id ? 'justify-end' : 'justify-start'} ${isConsecutive ? 'mb-1' : 'mb-4 mt-2'} w-full group`} key={m._id}>
            {m.sender._id !== user._id && (
              <div className={`w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 text-xs font-semibold shadow-sm overflow-hidden mr-3 flex-shrink-0 ${isConsecutive ? 'opacity-0 invisible' : 'opacity-100'}`}>
                {m.sender.pic ? (
                  <img
                    src={m.sender.pic}
                    alt={m.sender.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  m.sender.name[0].toUpperCase()
                )}
              </div>
            )}
            <div className={`flex flex-col max-w-[75%] sm:max-w-[70%] md:max-w-[65%] ${
              m.sender._id === user._id ? 'items-end' : 'items-start'
            }`}>
              <div className={`relative px-4 py-2.5 rounded-2xl shadow-sm transition-all group-hover:shadow-md group/message ${
                m.sender._id === user._id
                  ? `bg-indigo-600 text-white ${isConsecutive ? 'rounded-tr-md rounded-br-md' : 'rounded-tr-2xl rounded-br-sm'}`
                  : `bg-[#1e293b] text-slate-200 border border-slate-700/50 ${isConsecutive ? 'rounded-tl-md rounded-bl-md' : 'rounded-tl-2xl rounded-bl-sm'}`
              }`}>
                {m.fileUrl && (
                  <div className={`mb-2 max-w-full overflow-hidden rounded-[2rem] border shadow-sm transition-all duration-300 ${m.sender._id === user._id ? 'border-indigo-500/20 bg-indigo-600/10' : 'border-slate-700/40 bg-slate-900/80'}`}>
                    {m.fileType === 'image' && (
                      <div className="relative group/media overflow-hidden rounded-[1.75rem] shadow-lg shadow-black/20">
                        <ImageWithTransition
                          src={resolveFileUrl(m.fileUrl)}
                          alt={m.fileName}
                        />
                        <a 
                          href={resolveFileUrl(m.fileUrl)} 
                          download={m.fileName}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute bottom-3 right-3 p-2 bg-black/60 text-white rounded-full opacity-0 group-hover/media:opacity-100 transition-opacity"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                    {m.fileType === 'video' && (
                      <div className="relative group/media overflow-hidden rounded-[1.75rem] shadow-lg shadow-black/20">
                        <video 
                          src={resolveFileUrl(m.fileUrl)} 
                          controls 
                          className="w-full max-h-80 bg-black/20"
                        />
                        <a 
                          href={resolveFileUrl(m.fileUrl)} 
                          download={m.fileName}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-full opacity-0 group-hover/media:opacity-100 transition-opacity z-20"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                    {m.fileType === 'document' && (
                      <div className={`flex items-center space-x-3 p-4 rounded-[1.75rem] border ${
                        m.sender._id === user._id 
                          ? 'bg-indigo-600/10 border-indigo-500/20' 
                          : 'bg-slate-950/90 border-slate-700/50'
                      }`}>
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate">{m.fileName}</p>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Document</p>
                        </div>
                        <a 
                          href={resolveFileUrl(m.fileUrl)} 
                          download={m.fileName}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-slate-200 hover:bg-white/10 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                    {m.fileType === 'audio' && (
                      <div className={`flex items-center space-x-3 p-4 rounded-[1.75rem] border ${
                        m.sender._id === user._id 
                          ? 'bg-indigo-600/10 border-indigo-500/20' 
                          : 'bg-slate-950/90 border-slate-700/50'
                      }`}>
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300">
                          <Mic className="w-5 h-5" />
                        </div>
                        <audio 
                          src={resolveFileUrl(m.fileUrl)} 
                          controls 
                          className="h-10 w-full max-w-[180px] sm:max-w-[240px] custom-audio-player"
                        />
                      </div>
                    )}
                  </div>
                )}
                {m.content && <p className="text-[15px] font-medium leading-relaxed break-words py-0.5">{m.content}</p>}
                
                <div className={`flex items-center justify-end mt-1 space-x-1.5 ${
                  m.sender._id === user._id ? 'text-indigo-200' : 'text-slate-500'
                }`}>
                  {m.isEdited && !m.isDeleted && (
                    <span className="text-[9px] font-bold uppercase tracking-wider opacity-70">edited</span>
                  )}
                  <span className="text-[10px] font-medium tracking-wide">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {m.sender._id === user._id && (
                    <span className="flex items-center ml-0.5">
                      {m.readBy?.length > 0 ? (
                        <CheckCheck className="w-3.5 h-3.5 text-blue-300" />
                      ) : (
                        <CheckCheck className="w-3.5 h-3.5 opacity-50" />
                      )}
                    </span>
                  )}
                </div>

                {/* Message Menu (Edit/Delete) - Only for own messages and not already deleted */}
                {m.sender._id === user._id && !m.isDeleted && (
                  <div className="absolute top-1 right-1 opacity-0 group-hover/message:opacity-100 transition-opacity flex bg-black/20 rounded-lg p-0.5 backdrop-blur-sm shadow-sm ring-1 ring-white/10">
                    <button 
                      onClick={() => onEditMessage(m)}
                      className="p-1.5 hover:text-indigo-300 transition-colors"
                      title="Edit message"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => onDeleteMessage(m._id)}
                      className="p-1.5 hover:text-red-400 transition-colors"
                      title="Delete for everyone"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Minimalist self-avatar */}
            {m.sender._id === user._id && (
              <div className="w-8 h-8 rounded-full ml-3 flex-shrink-0 hidden md:block opacity-0 invisible">
              </div>
            )}
          </div>
        )})}
      </ScrollableFeed>
    </div>
  );
};

export default ScrollableChat;
