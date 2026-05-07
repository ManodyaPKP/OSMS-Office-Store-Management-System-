import React, { useState, useEffect, useRef } from 'react';

export const MessageChat = ({ conversationId, onBack, user }) => {
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

      const response = await fetch('http://localhost:5000/api/messages/send', {
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
    return <div className="page-container"><p>Loading conversation...</p></div>;
  }

  if (!otherUser) {
    return <div className="page-container"><p>Conversation not found</p></div>;
  }

  return (
    <div className="message-chat-container">
      <div className="chat-header">
        <button onClick={onBack} className="btn btn-secondary">
          ← Back
        </button>
        <h2>💬 Chat with {otherUser.full_name}</h2>
        <div></div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError('')} style={{ marginLeft: '10px' }}>✕</button>
        </div>
      )}

      <div className="messages-area">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>📭 No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((msg, index) => (
              <div
                key={msg.id}
                className={`message-item ${msg.sender_id === user.id ? 'sent' : 'received'}`}
              >
                {index === 0 && (
                  <div className="message-subject">
                    <strong>Subject:</strong> {msg.subject}
                  </div>
                )}
                <div className="message-content">
                  <p>{msg.message}</p>
                  <span className="message-time">
                    {new Date(msg.created_at).toLocaleString()}
                  </span>
                  {msg.sender_id === user.id && (
                    <button
                      onClick={() => deleteMessage(msg.id)}
                      className="delete-btn"
                      title="Delete message"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="message-input-area">
        {messages.length === 0 && (
          <div className="form-group">
            <label>Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter message subject"
              className="form-input"
              disabled={sending}
            />
          </div>
        )}

        <div className="form-group">
          <label>Message</label>
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message..."
            className="form-input message-textarea"
            disabled={sending}
            rows="4"
          />
        </div>

        <div className="form-actions">
          <button
            onClick={sendMessage}
            disabled={sending || !messageText.trim()}
            className="btn btn-primary"
          >
            {sending ? 'Sending...' : '📤 Send'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .message-chat-container {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 80px);
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid #eee;
          background: #f5f5f5;
        }

        .chat-header h2 {
          margin: 0;
          font-size: 18px;
        }

        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .no-messages {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #999;
        }

        .messages-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .message-item {
          margin-bottom: 8px;
        }

        .message-item.sent {
          display: flex;
          justify-content: flex-end;
        }

        .message-item.received {
          display: flex;
          justify-content: flex-start;
        }

        .message-subject {
          padding: 8px 12px;
          background: #f0f0f0;
          border-radius: 4px;
          font-size: 12px;
          color: #666;
          margin-bottom: 4px;
          width: 100%;
        }

        .message-content {
          max-width: 70%;
          padding: 12px;
          border-radius: 8px;
          word-break: break-word;
          position: relative;
        }

        .message-item.sent .message-content {
          background: #1976d2;
          color: white;
        }

        .message-item.received .message-content {
          background: #f0f0f0;
          color: #333;
        }

        .message-content p {
          margin: 0 0 8px 0;
          line-height: 1.4;
        }

        .message-time {
          display: block;
          font-size: 11px;
          opacity: 0.7;
          margin-top: 4px;
        }

        .delete-btn {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          opacity: 0.7;
          margin-left: 8px;
          padding: 0;
          font-size: 12px;
        }

        .delete-btn:hover {
          opacity: 1;
        }

        .message-input-area {
          padding: 16px;
          border-top: 1px solid #eee;
          background: #f9f9f9;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
        }

        .form-group label {
          font-weight: 600;
          font-size: 14px;
          color: #333;
        }

        .form-input {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          font-family: inherit;
        }

        .form-input:focus {
          outline: none;
          border-color: #1976d2;
          box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
        }

        .message-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .form-actions {
          display: flex;
          gap: 8px;
        }

        .alert {
          padding: 12px 16px;
          border-radius: 4px;
          margin-bottom: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #ffebee;
          color: #c62828;
          border-left: 4px solid #c62828;
        }

        .alert button {
          background: none;
          border: none;
          cursor: pointer;
          color: inherit;
          padding: 0;
        }
      `}</style>
    </div>
  );
};

export default MessageChat;
