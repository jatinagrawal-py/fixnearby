// frontend/src/components/Chat/ChatWindow.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { getSocket, joinChatRoom, sendMessage, onEvent, offEvent } from '../../services/socketService';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import LoadingSpinner from '../LoadingSpinner';
const ChatWindow = ({ conversationId, participantRole }) => {
  const { user, repairer } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [chatEnded, setChatEnded] = useState(false);
  const [chatEndedReason, setChatEndedReason] = useState(null);
  const [chatError, setChatError] = useState(null);
  const messagesEndRef = useRef(null);

  const currentUserId = participantRole === 'user' ? user?._id : repairer?._id;
  const currentUserModel = participantRole === 'user' ? 'User' : 'Repairer';

  useEffect(() => {
    if (!conversationId || !currentUserId) {
      setChatError("No conversation selected or user not logged in. Please select a chat to begin.");
      setLoadingMessages(false);
      return;
    }

    const socket = getSocket();

    if (!socket) {
      setChatError("Chat service not available. Please refresh the page.");
      setLoadingMessages(false);
      return;
    }

    setMessages([]);
    setNewMessage('');
    setLoadingMessages(true);
    setChatEnded(false);
    setChatEndedReason(null);
    setChatError(null);

    joinChatRoom(conversationId);

    const handlePastMessages = (pastMsgs) => {
      console.log("Received past messages:", pastMsgs);
      setMessages(pastMsgs);
      setLoadingMessages(false);
      scrollToBottom();
    };

    const handleReceiveMessage = (msg) => {
      console.log("Received new message:", msg);
      setMessages((prevMessages) => [...prevMessages, msg]);
      scrollToBottom();
    };

    const handleChatEnded = (reason) => {
      console.warn("Chat ended:", reason);
      setChatEnded(true);
      setChatEndedReason(reason);
      toast.error(`Chat ended: ${reason}`);
    };

    const handleChatError = (err) => {
      console.error("Chat error:", err);
      setChatError(err);
      toast.error(`Chat error: ${err}`);
      setLoadingMessages(false);
    };

    onEvent('pastMessages', handlePastMessages);
    onEvent('receiveMessage', handleReceiveMessage);
    onEvent('chatEnded', handleChatEnded);
    onEvent('chatError', handleChatError);

    return () => {
      offEvent('pastMessages', handlePastMessages);
      offEvent('receiveMessage', handleReceiveMessage);
      offEvent('chatEnded', handleChatEnded);
      offEvent('chatError', handleChatError);
    };
  }, [conversationId, currentUserId, participantRole, setLoadingMessages]); 

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && !chatEnded) {
      const messageData = {
        conversationId,
        senderId: currentUserId,
        senderModel: currentUserModel,
        message: newMessage.trim(),
      };
      sendMessage(messageData);
      setNewMessage('');
    }
  };

  if (chatError && !loadingMessages && messages.length === 0 && !chatEnded) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-600 bg-red-50 p-6 rounded-lg text-center shadow-md border border-red-200">
        <MessageCircle className="w-10 h-10 mb-4 text-red-500" />
        <p className="font-semibold text-lg">Chat Error</p>
        <p>{chatError}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md border border-gray-100"> {/* Main chat window background */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar-light"> {/* Using light scrollbar (conceptual) */}
        {loadingMessages ? (
          <div className="flex flex-col items-center justify-center h-full text-green-600"> {/* Green for loading */}
            <LoadingSpinner className="w-8 h-8 animate-spin mb-4" />
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 && !chatEnded ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={msg._id || index}
              className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`p-3 rounded-lg max-w-[80%] break-words shadow-sm ${
                  msg.senderId === currentUserId
                    ? 'bg-green-500 text-white rounded-br-none' 
                    : 'bg-gray-100 text-gray-800 rounded-bl-none' 
                }`}
              >
                <p className={`font-semibold text-xs mb-1 ${msg.senderId === currentUserId ? 'text-green-100' : 'text-gray-600'}`}>
                  {msg.senderId === currentUserId ? 'You' : msg.senderName || 'Participant'}
                </p>
                <p className="text-sm">{msg.message || msg.text}</p>
                <span className={`text-xs opacity-75 mt-1 block text-right ${msg.senderId === currentUserId ? 'text-green-200' : 'text-gray-500'}`}>
                  {new Date(msg.timestamp || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 bg-white">
        {chatEnded ? (
          <p className="text-red-600 text-center font-semibold">
            Chat is closed. {chatEndedReason ? `(${chatEndedReason})` : ''}
          </p>
        ) : (
          <div className="flex space-x-3">
            <input
              type="text"
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              disabled={loadingMessages || chatEnded}
            />
            <button
              onClick={handleSendMessage}
              className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md" 
              disabled={!newMessage.trim() || loadingMessages || chatEnded}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;