import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api.js";

const Dashboard = () => {
  const navigate = useNavigate();
  const [emails, setEmails] = useState([]);
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  const sampleEmails = [];

  useEffect(() => {

  }, []);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      console.log("Fetching emails from backend...");
      const response = await api.get('api/emails/today');
      
      let emailsData = [];
      if (response.data && response.data.mail && Array.isArray(response.data.mail)) {
        emailsData = response.data.mail;
      } else if (response.data && Array.isArray(response.data)) {
        emailsData = response.data;
      } else {
        console.error('Invalid response format:', response.data);
        setEmails([]);
        setFilteredEmails([]);
        return;
      }

      setEmails(emailsData);
      setFilteredEmails(emailsData);
      

      const uniqueCategories = [...new Set(emailsData.map(email => email.category))];
      setCategories(uniqueCategories.filter(cat => cat && cat.trim() !== ''));
      
      console.log(`Fetched ${emailsData.length} emails successfully`);
    } catch (error) {
      console.error('Error fetching emails:', error);
      
      if (error.response?.status === 404) {
        console.log('No emails found for today');
        setEmails([]);
        setFilteredEmails([]);
      } else if (error.response?.status >= 500) {
        console.log('Server error. Please try again later.');
      } else {
        console.log('Failed to fetch emails. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterEmails = () => {
    let filtered = emails;
    if (categoryFilter !== "all") {
      filtered = filtered.filter(email => email.category === categoryFilter);
    }
    if (priorityFilter !== "all") {
      filtered = filtered.filter(email => email.priority === priorityFilter);
    }
    setFilteredEmails(filtered);
  };

  useEffect(() => {
    filterEmails();
  }, [categoryFilter, priorityFilter, emails]);

  const sendChatMessage = async () => {
    if (chatInput.trim() && !chatLoading) {
      const userMessage = chatInput.trim();
      setChatLoading(true);
      
      setChatMessages(prev => [...prev, { type: "user", message: userMessage }]);
      setChatInput("");
  
      setChatMessages(prev => [...prev, { type: "bot", message: "Getting Response...", isTyping: true }]);
      
      try {
       
        const response = await api.post('/api/chat', { question: userMessage });
        
    
        setChatMessages(prev => {
          const withoutTyping = prev.filter(msg => !msg.isTyping);
          return [...withoutTyping, { 
            type: "bot", 
            message: response.data.answer || "Sorry, I couldn't process your request." 
          }];
        });
        
      } catch (error) {
        console.error('Chat error:', error);
        
     
        setChatMessages(prev => {
          const withoutTyping = prev.filter(msg => !msg.isTyping);
          return [...withoutTyping, { 
            type: "bot", 
            message: "Sorry, I'm having trouble connecting right now. Please try again later." 
          }];
        });
      } finally {
        setChatLoading(false);
      }
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-800 border-red-200";
      case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityCount = (priority) => {
    return emails.filter(email => email.priority === priority).length;
  };

  const handleLogout = async () => {
    try {
   
      await api.post('/logout');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.clear();
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <nav className="w-full bg-white border-b border-gray-200 py-6 px-8 flex items-center justify-between shadow-sm">
        <div className="text-3xl font-black text-slate-800 tracking-wide">Mailmate</div>
        <button 
          onClick={handleLogout}
          className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Chat Bot (1/3 width) */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-slate-800">Chat Assistant</h3>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto scrollbar-hide mb-75 ">
            {chatMessages.length === 0 ? (
              <div className="text-gray-500 text-center mt-8">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.98L3 20l1.98-5.874A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                  </svg>
                </div>
                <p>Start a conversation with your email assistant!</p>
                <p className="text-sm mt-2">Ask me about your emails, priorities, or get help organizing your inbox.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.type === "user" 
                        ? "bg-blue-600 text-white rounded-br-none" 
                        : "bg-gray-100 text-gray-800 rounded-bl-none"
                    }`}>
                      {msg.isTyping ? (
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-sm text-gray-500">Typing...</span>
                        </div>
                      ) : (
                        <p className="text-sm">{msg.message}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Chat Input - Fixed at bottom */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex ">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={chatLoading ? "Waiting for response..." : "Ask about your emails..."}
                disabled={chatLoading}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                onKeyPress={(e) => e.key === "Enter" && !chatLoading && sendChatMessage()}
              />
              <button
                onClick={sendChatMessage}
                disabled={chatLoading || !chatInput.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors flex items-center disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {chatLoading ? (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Content Area (2/3 width) */}
        <div className="w-2/3 flex flex-col">
          {/* Priority Boxes */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{getPriorityCount("High")}</div>
                <div className="text-red-800 font-semibold">High Priority</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{getPriorityCount("Medium")}</div>
                <div className="text-yellow-800 font-semibold">Medium Priority</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{getPriorityCount("Low")}</div>
                <div className="text-green-800 font-semibold">Low Priority</div>
              </div>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <button
              onClick={fetchEmails}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Fetching...
                </>
              ) : (
                'Fetch Today\'s Emails'
              )}
            </button>
            
            <div className="flex gap-4">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Email List or Email Detail */}
          <div className="flex-1 p-6 overflow-y-auto scrollbar-hide">
            {selectedEmail ? (
              // Email Detail View
              <div className="max-w-4xl">
                <div className="flex items-center mb-6">
                  <button
                    onClick={() => setSelectedEmail(null)}
                    className="mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h2 className="text-2xl font-bold text-slate-800">Email Details</h2>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">{selectedEmail.subject}</h3>
                    <div className="flex flex-wrap gap-3 mb-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(selectedEmail.priority)}`}>
                        {selectedEmail.priority} Priority
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 border border-blue-200 rounded-full text-sm font-medium">
                        {selectedEmail.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <span className="font-semibold text-gray-700">From: </span>
                        <span className="text-slate-800">{selectedEmail.from}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">Email Content:</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-slate-700 whitespace-pre-line leading-relaxed">
                        {selectedEmail.body}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Email List View
              <div>
                {/* Table Header */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-3">
                      <div className="font-semibold text-gray-700 text-sm">FROM</div>
                    </div>
                    <div className="col-span-5">
                      <div className="font-semibold text-gray-700 text-sm">SUBJECT</div>
                    </div>
                    <div className="col-span-2 text-center">
                      <div className="font-semibold text-gray-700 text-sm">CATEGORY</div>
                    </div>
                    <div className="col-span-2 text-center">
                      <div className="font-semibold text-gray-700 text-sm">PRIORITY</div>
                    </div>
                  </div>
                </div>

                {/* Email List */}
                <div className="space-y-3">
                  {filteredEmails.map((email, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedEmail(email)}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="grid grid-cols-12 gap-4 items-center">
                        {/* From Column */}
                        <div className="col-span-3">
                          <div className="font-semibold text-slate-800 text-sm truncate">{email.from}</div>
                        </div>
                        
                        {/* Subject Column */}
                        <div className="col-span-5">
                          <div className="text-lg font-medium text-slate-700 truncate">{email.subject}</div>
                        </div>
                        
                        {/* Category Column */}
                        <div className="col-span-2 flex justify-center">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 border border-blue-200 rounded-full text-sm font-medium">
                            {email.category}
                          </span>
                        </div>
                        
                        {/* Priority Column */}
                        <div className="col-span-2 flex justify-center">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(email.priority)}`}>
                            {email.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;