import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export const MessagesPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [adminList, setAdminList] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadConversations();
    // Refresh conversations every 10 seconds
    const interval = setInterval(loadConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadConversations = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/messages/conversations/all', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setConversations(data.data);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadAdminList = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/users/admins', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAdminList(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading admin list:', error);
    }
  };

  const handleStartConversation = async (adminId) => {
    setSelectedConversation(`${user.id}_${adminId}`);
    setShowNewMessage(false);
    loadConversations();
  };

  const handleNewMessageClick = () => {
    loadAdminList();
    setShowNewMessage(true);
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
    loadConversations();
  };

  if (selectedConversation) {
    // Show chat interface for selected conversation
    return <MessageChatUI conversationId={selectedConversation} onBack={handleBackToList} user={user} />;
  }

  return (
    <div className="flex-1 p-5">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-slate-900">💬 Messages</h1>
        {user.role !== 'admin' && (
          <button onClick={handleNewMessageClick} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            ✉️ New Message
          </button>
        )}
      </div>

      {error && (
        <div className="px-5 py-4 rounded-lg mb-5 text-sm border-l-4 bg-red-50 text-red-900 border-l-red-600">{error}</div>
      )}

      {showNewMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowNewMessage(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Send Message to Administrator</h2>
            <div className="space-y-2">
              {adminList.length === 0 ? (
                <p className="text-slate-600">No administrators available</p>
              ) : (
                adminList.map((admin) => (
                  <div key={admin.id} className="p-3 border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-slate-900">{admin.full_name}</h3>
                      <p className="text-xs text-slate-600">@{admin.username}</p>
                    </div>
                    <button
                      onClick={() => handleStartConversation(admin.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Message
                    </button>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => setShowNewMessage(false)}
              className="mt-4 w-full px-4 py-2 bg-slate-400 text-white rounded-lg hover:bg-slate-500 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="px-5 py-12 text-center text-slate-400">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-lg font-semibold text-slate-500">No conversations yet</p>
            {user.role !== 'admin' && (
              <p className="text-sm text-slate-400 mt-2">Click "New Message" to start chatting with an administrator</p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-200 max-h-[600px] overflow-y-auto">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(`${user.id}_${conv.id}`)}
                className="p-4 hover:bg-slate-50 cursor-pointer flex items-center gap-4 border-b last:border-b-0 transition-colors"
              >
                <div className="text-3xl">👤</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900">{conv.full_name}</h3>
                  <p className="text-sm text-slate-600 truncate">
                    {conv.last_message ? conv.last_message.substring(0, 50) + '...' : 'No messages yet'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {conv.last_message_date ? new Date(conv.last_message_date).toLocaleDateString() : ''}
                  </p>
                </div>
                {conv.unread_count > 0 && (
                  <div className="inline-flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full">
                    {conv.unread_count}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Message Chat Component
const MessageChatUI = ({ conversationId, onBack, user }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [messageText, setMessageText] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `http://localhost:5000/api/messages/messages/${conversationId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      if (data.success) {
        setMessages(data.data.messages);
        setOtherUser(data.data.otherUser);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim()) {
      setError('Message cannot be empty');
      return;
    }

    if (messages.length === 0 && !subject.trim()) {
      setError('Subject is required for first message');
      return;
    }

    try {
      setSending(true);
      const token = localStorage.getItem('authToken');
      const messageSubject = messages.length > 0 ? 'Re: ' + (messages[0].subject || 'Message') : subject;

      const response = await fetch('http://localhost:5000/api/messages/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientId: otherUser.id,
          subject: messageSubject,
          message: messageText
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessageText('');
        if (messages.length === 0) {
          setSubject('');
        }
        loadMessages();
      } else {
        setError(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const deleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/messages/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        loadMessages();
      } else {
        setError(data.message || 'Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      setError('Failed to delete message');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-5">
        <div className="flex justify-center items-center min-h-[400px] bg-white rounded-xl">
          <div className="w-12 h-12 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!otherUser) {
    return <div className="flex-1 p-5"><p>Conversation not found</p></div>;
  }

  return (
    <div className="flex-1 p-5 flex flex-col">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium">
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-slate-900">💬 Chat with {otherUser.full_name}</h1>
      </div>

      {error && (
        <div className="px-5 py-4 rounded-lg mb-5 text-sm border-l-4 bg-red-50 text-red-900 border-l-red-600 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-400">
              <p>📭 No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => (
                <div key={msg.id} className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs ${msg.sender_id === user.id ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-900'} rounded-lg p-3`}>
                    {index === 0 && (
                      <p className="text-xs font-semibold mb-1 opacity-75">Subject: {msg.subject}</p>
                    )}
                    <p className="break-words">{msg.message}</p>
                    <p className="text-xs mt-2 opacity-75">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {msg.sender_id === user.id && (
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        className="text-xs mt-1 opacity-75 hover:opacity-100"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="border-t border-slate-200 p-4 space-y-3">
          {messages.length === 0 && (
            <div>
              <label className="text-xs text-slate-600 font-semibold uppercase">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter message subject"
                className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                disabled={sending}
              />
            </div>
          )}

          <div>
            <label className="text-xs text-slate-600 font-semibold uppercase">Message</label>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message..."
              className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
              disabled={sending}
              rows="3"
            />
          </div>

          <button
            onClick={sendMessage}
            disabled={sending || !messageText.trim()}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 transition-colors font-medium"
          >
            {sending ? 'Sending...' : '📤 Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

const useRef = React.useRef;

export default MessagesPage;
