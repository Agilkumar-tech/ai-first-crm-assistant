import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { submitChatMessage } from './store/crmSlice';
import './App.css';

// Simple action creator to handle manual form updates directly in the component
const updateField = (field, value) => ({
  type: 'crm/updateField',
  payload: { field, value }
});

export default function App() {
  const dispatch = useDispatch();
  const formData = useSelector((state) => state.crm.formData);
  const chatHistory = useSelector((state) => state.crm.chatHistory);
  const loadingStatus = useSelector((state) => state.crm.status);
  
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loadingStatus === 'loading') return;
    dispatch(submitChatMessage(inputMessage));
    setInputMessage('');
  };

  // Helper function to update form state fields manually
  const handleFieldChange = (field, value) => {
    dispatch(updateField(field, value));
  };

  return (
    <div className="app-main-container">
    
      <div className="log-hcp-panel">
        <h2 className="main-title">Log HCP Interaction</h2>

        
        <div className="form-section">
          <h3 className="section-title">Interaction Details</h3>
          
          <div className="form-row">
            <div className="form-group flex-2">
              <label>HCP Name</label>
              <input 
                type="text" 
                value={formData.hcp_name || ''} 
                onChange={(e) => handleFieldChange('hcp_name', e.target.value)}
                placeholder="Search or select HCP..." 
              />
            </div>
            <div className="form-group flex-1">
              <label>Interaction Type</label>
              <select 
                value={formData.interaction_type || 'Meeting'} 
                onChange={(e) => handleFieldChange('interaction_type', e.target.value)}
              >
                <option value="Meeting">Meeting</option>
                <option value="Call">Call</option>
                <option value="Email">Email</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-1 input-icon-container calendar-icon">
              <label>Date</label>
              <input 
                type="text" 
                value={formData.date || '04/19/2025'} 
                onChange={(e) => handleFieldChange('date', e.target.value)}
              />
            </div>
            <div className="form-group flex-1 input-icon-container clock-icon">
              <label>Time</label>
              <input 
                type="text" 
                value={formData.time || '07:36 PM'} 
                onChange={(e) => handleFieldChange('time', e.target.value)}
              />
            </div>
          </div>
        </div>

    
        <div className="form-section">
          <div className="form-group">
            <label>Attendees</label>
            <input 
              type="text" 
              value={formData.attendees?.join(', ') || ''} 
              onChange={(e) => handleFieldChange('attendees', e.target.value.split(', '))}
              placeholder="Enter names separated by commas..." 
            />
          </div>
        </div>

        <div className="form-section">
          <div className="form-group">
            <label>Topics Discussed</label>
            <textarea 
              value={formData.topics_discussed || ''} 
              onChange={(e) => handleFieldChange('topics_discussed', e.target.value)}
              placeholder="Enter key discussion points..." 
            />
          </div>
          <div className="voice-note-link" style={{ cursor: 'pointer' }}>
            <span className="mic-icon">🎤</span> Summarize from Voice Note (Requires Consent)
          </div>
        </div>

     
        <div className="form-section materials-section">
          <h3 className="section-title sub-heading">Materials Shared / Samples Distributed</h3>
          
          <div className="form-group margin-bottom-md">
            <label>Materials Shared</label>
            <div className="flex-space-between-center">
              <input 
                type="text"
                className="dynamic-input-inline"
                value={formData.materials_shared?.join(', ') || ''}
                onChange={(e) => handleFieldChange('materials_shared', e.target.value.split(', '))}
                placeholder="No materials added."
              />
              <button className="inline-action-btn search-icon" type="button">Search/Add</button>
            </div>
          </div>

          <div className="form-group margin-bottom-lg">
            <label>Samples Distributed</label>
            <div className="flex-space-between-center">
              <input 
                type="text"
                className="dynamic-input-inline"
                value={formData.samples_distributed?.join(', ') || ''}
                onChange={(e) => handleFieldChange('samples_distributed', e.target.value.split(', '))}
                placeholder="No samples added."
              />
              <button className="inline-action-btn plus-icon" type="button">Add Sample</button>
            </div>
          </div>
        </div>

        <div className="form-section">
          <label>Observed/Inferred HCP Sentiment</label>
          <div className="sentiment-radio-group">
            {[
              { label: 'Positive', emoji: '😊' },
              { label: 'Neutral', emoji: '😐' },
              { label: 'Negative', emoji: '😞' }
            ].map((s) => (
              <label key={s.label} className="radio-label" style={{ cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="sentiment" 
                  checked={(formData.sentiment || 'Neutral') === s.label} 
                  onChange={() => handleFieldChange('sentiment', s.label)}
                />
                <span className="custom-radio-circle"></span>
                <span className="emoji-spacing">{s.emoji}</span> {s.label}
              </label>
            ))}
          </div>
        </div>

        
        <div className="form-section">
          <div className="form-group">
            <label>Outcomes</label>
            <textarea 
              value={formData.outcomes || ''} 
              onChange={(e) => handleFieldChange('outcomes', e.target.value)}
              placeholder="Key outcomes or agreements..." 
            />
          </div>
        </div>

        
        <div className="form-section">
          <div className="form-group">
            <label>Follow-up Actions</label>
            <textarea 
              value={formData.follow_up_actions || ''} 
              onChange={(e) => handleFieldChange('follow_up_actions', e.target.value)}
              placeholder="Enter follow-up actions..." 
            />
          </div>
        </div>
      </div>

      
      <div className="ai-assistant-panel">
        <div className="ai-header">
          <h3><span className="bot-head-icon">🤖</span> AI Assistant</h3>
          <div>Log Interaction details here via chat</div>
        </div>

        <div className="chat-conversation-area">
          {chatHistory.map((msg, index) => {
            let bubbleClass = "ai-chat-bubble";
            if (msg.sender === 'user') bubbleClass = "user-chat-bubble";
            else if (msg.text.includes("successfully") || msg.text.includes("Logged")) bubbleClass = "success-chat-bubble";

            return (
              <div key={index} className={bubbleClass}>
                <p>{msg.text}</p>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSendMessage} className="chat-input-row">
          <textarea 
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Describe Interaction..." 
          />
          <button type="submit" disabled={loadingStatus === 'loading'}>
            {loadingStatus === 'loading' ? '...' : 'Log'}
          </button>
        </form>
      </div>
    </div>
  );
}