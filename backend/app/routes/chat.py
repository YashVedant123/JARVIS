from fastapi import APIRouter
from pydantic import BaseModel
from cerebras.cloud.sdk import Cerebras
from app.memory.profile import get_profile
import os

router = APIRouter()

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: list[Message]

def build_system_prompt():
    profile = get_profile()
    if profile:
        return f"""You are JARVIS, an advanced AI assistant inspired by Iron Man.
You are highly intelligent, efficient, and slightly witty.
The user's name is {profile['name']}.
You address them as {profile['address_as']}.
They primarily use you for: {profile['use_case']}.
Never break character."""
    return """You are JARVIS, an advanced AI assistant inspired by Iron Man.
You are highly intelligent, efficient, and slightly witty.
You have not yet been introduced to this user.
Never break character."""

@router.post("/chat")
async def chat(request: ChatRequest):
    client = Cerebras(api_key=os.getenv("CEREBRAS_API_KEY"))
    response = client.chat.completions.create(
        model="llama3.1-8b",
        messages=[
            {"role": "system", "content": build_system_prompt()},
            *[{"role": m.role, "content": m.content} for m in request.messages]
        ]
    )
    return {"response": response.choices[0].message.content}