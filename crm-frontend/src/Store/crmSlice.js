import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Helper helpers to initialize the form with the current date/time dynamically
const getCurrentDate = () => {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${month}/${day}/${d.getFullYear()}`; // Formats: MM/DD/YYYY
};

const getCurrentTime = () => {
  const d = new Date();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // The hour '0' should be '12'
  return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`; // Formats: HH:MM AM/PM
};

const initialState = {
  formData: {
    hcp_name: '', 
    interaction_type: 'Meeting', 
    date: getCurrentDate(), 
    time: getCurrentTime(), 
    attendees: [], 
    topics_discussed: '', 
    materials_shared: [], 
    samples_distributed: [],
    sentiment: 'Neutral', 
    outcomes: '', 
    follow_up_actions: ''
  },
  chatHistory: [
    { sender: 'ai', text: 'Log interaction details here or ask for help.' }
  ],
  status: 'idle'
};

export const submitChatMessage = createAsyncThunk(
  'crm/submitChatMessage',
  async (messageText, { getState, rejectWithValue }) => {
    try {
      const { crm } = getState();
      // Locked onto the unified port 8000
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          current_form: crm.formData
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData.detail || `Server error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message || 'Network connection failed');
    }
  }
);

const crmSlice = createSlice({
  name: 'crm',
  initialState,
  reducers: {
    resetForm: (state) => { 
      state.formData = {
        ...initialState.formData,
        date: getCurrentDate(),
        time: getCurrentTime()
      }; 
    },
    // Allows manual keyboard updates fallback to override AI values
    updateField: (state, action) => {
      const { field, value } = action.payload;
      state.formData[field] = value;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitChatMessage.pending, (state, action) => {
        state.status = 'loading';
        state.chatHistory.push({ sender: 'user', text: action.meta.arg });
      })
      .addCase(submitChatMessage.fulfilled, (state, action) => {
        state.status = 'idle';
        if (action.payload && action.payload.form_data) {
          state.formData = {
            ...state.formData,
            ...action.payload.form_data,
            attendees: action.payload.form_data.attendees || [],
            materials_shared: action.payload.form_data.materials_shared || [],
            samples_distributed: action.payload.form_data.samples_distributed || []
          };
          state.chatHistory.push({ sender: 'ai', text: action.payload.reply });
        }
      })
      .addCase(submitChatMessage.rejected, (state, action) => {
        state.status = 'failed';
        state.chatHistory.push({ 
          sender: 'ai', 
          text: `❌ Error: ${action.payload || 'Failed to connect to backend server.'}` 
        });
      });
  }
});

export const { resetForm, updateField } = crmSlice.actions;
export default crmSlice.reducer;