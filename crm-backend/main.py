import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
from langchain_groq import ChatGroq
from langchain_core.tools import tool
from langchain_core.messages import HumanMessage, SystemMessage

app = FastAPI(title="AI-First CRM Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

llm = ChatGroq(
    model="llama-3.1-8b-instant", 
    temperature=0.0, 
    groq_api_key="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"
)

class FormState(BaseModel):
    hcp_name: Optional[str] = ""
    interaction_type: str = "Meeting"
    date: Optional[str] = Field(default_factory=lambda: datetime.now().strftime("%m/%d/%Y"))
    time: Optional[str] = Field(default_factory=lambda: datetime.now().strftime("%I:%M %p"))
    attendees: List[str] = []
    topics_discussed: Optional[str] = ""
    materials_shared: List[str] = []
    samples_distributed: List[str] = []
    sentiment: str = "Neutral"
    outcomes: Optional[str] = ""
    follow_up_actions: Optional[str] = ""

@tool
def log_interaction(
    hcp_name: Optional[str] = None,
    interaction_type: Optional[str] = None,
    date: Optional[str] = None,
    time: Optional[str] = None,
    topics_discussed: Optional[str] = None,
    sentiment: Optional[str] = None,
    materials_shared: Optional[str] = None
) -> str:
    """Extracts raw details to populate the initial CRM staging form state fields."""
    return "SUCCESS"

@tool
def edit_interaction(hcp_name: Optional[str] = None, sentiment: Optional[str] = None, topics_discussed: Optional[str] = None) -> str:
    """Modifies custom, isolated parameters inside the CRM state."""
    return "SUCCESS"

@tool
def append_follow_up_tasks(task_description: str) -> str:
    """Appends explicit operational commitments into the form layout."""
    return "SUCCESS"

@tool
def add_distributed_sample(sample_name: str, quantity: int = 1) -> str:
    """Registers product inventory samples distributed directly to target clinics."""
    return "SUCCESS"

@tool
def clear_form_state() -> str:
    """Resets the form layout data model parameters completely back to structural baseline arrays."""
    return "SUCCESS"

tools = [log_interaction, edit_interaction, append_follow_up_tasks, add_distributed_sample, clear_form_state]

class ChatPayload(BaseModel):
    message: str 
    current_form: FormState

@app.post("/api/chat")
async def process_chat(payload: ChatPayload):
    try:
        system_prompt = (
            "You are an expert Life Science CRM Assistant.\n"
            f"Current form data: {payload.current_form.dict()}\n"
            "Call log_interaction if the user provides a summary of a meeting or call. Extract names, topics, and sentiment fields cleanly."
        )
        
        llm_with_tools = llm.bind_tools(tools)
        response = llm_with_tools.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=payload.message)
        ])
        
        updated_form = payload.current_form.dict()
        ai_response_text = response.content or "I have successfully processed your request and updated the form layout."

        if response.tool_calls:
            for tool_call in response.tool_calls:
                name = tool_call['name']
                args = tool_call['args']
                
                if name in ['log_interaction', 'edit_interaction']:
                    cleaned_args = {k: v for k, v in args.items() if v is not None}
                    
                    if 'materials_shared' in cleaned_args and cleaned_args['materials_shared']:
                        mat = cleaned_args['materials_shared']
                        cleaned_args['materials_shared'] = [mat] if isinstance(mat, str) else mat
                        
                    if 'sentiment' in cleaned_args and isinstance(cleaned_args['sentiment'], str):
                        cleaned_args['sentiment'] = cleaned_args['sentiment'].strip().capitalize()
                        
                    updated_form.update(cleaned_args)
                    
                elif name == 'append_follow_up_tasks':
                    updated_form['follow_up_actions'] = args.get('task_description', '')
                    
                elif name == 'add_distributed_sample':
                    s_name = args.get('sample_name', 'Product Sample')
                    s_qty = args.get('quantity', 1)
                    if not isinstance(updated_form['samples_distributed'], list):
                        updated_form['samples_distributed'] = []
                    updated_form['samples_distributed'].append(f"{s_name} (x{s_qty})")
                    
                elif name == 'clear_form_state':
                    updated_form = {
                        "hcp_name": "", 
                        "interaction_type": "Meeting", 
                        "date": datetime.now().strftime("%m/%d/%Y"), 
                        "time": datetime.now().strftime("%I:%M %p"), 
                        "attendees": [], "topics_discussed": "", 
                        "materials_shared": [], "samples_distributed": [], 
                        "sentiment": "Neutral", "outcomes": "", "follow_up_actions": ""
                    }
                    
            ai_response_text = f"Interaction logged successfully!** The details (HCP Name, Date, Sentiment, and Materials) have been automatically populated based on your summary. Would you like me to suggest a specific follow-up action, such as scheduling a meeting?: {', '.join([tc['name'] for tc in response.tool_calls])}."

        return {
            "reply": ai_response_text,
            "form_data": updated_form
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)