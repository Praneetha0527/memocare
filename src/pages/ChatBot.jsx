import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! How can I help you today?', time: new Date().toLocaleTimeString() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message to chat
    const userMessage = {
      sender: 'user',
      text: inputValue,
      time: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Send message to your Python backend
      const backendUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "");
      const response = await fetch(`${backendUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputValue })
      });


      const data = await response.json();
      
      // Add bot response to chat
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: data.response,
        time: new Date().toLocaleTimeString()
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: "Sorry, I'm having trouble connecting. Please try again later.",
        time: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Predefined questions for easy access
  const quickQuestions = [
    "What day is it today?",
    "Where am I?",
    "What time is it?",
    "Who are you?",
    "Help me remember something"
  ];

  return (
    <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
      {/* Chatbot toggle button */}
      <button 
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '×' : '💬'}
      </button>

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>Memory Helper Chat</h3>
            <button 
              className="close-button"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`message ${msg.sender}`}
              >
                <div className="message-content">
                  <p>{msg.text}</p>
                  <span className="message-time">{msg.time}</span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="message bot">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick questions buttons */}
          <div className="quick-questions">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                className="quick-question"
                onClick={() => setInputValue(question)}
              >
                {question}
              </button>
            ))}
          </div>

          {/* Message input form */}
          <form onSubmit={handleSendMessage} className="chatbot-input">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message here..."
              aria-label="Type your message"
            />
            <button type="submit" disabled={!inputValue.trim()}>
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;