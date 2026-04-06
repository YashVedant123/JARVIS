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
    location: str | None = None

def build_system_prompt(location: str | None = None):
    profile = get_profile()
    location_str = f"\nThe user's current location is: {location}." if location else "\nYou do not have access to the user's location."
    if profile:
        return f"""You are JARVIS, an advanced AI assistant inspired by Iron Man.
You are highly intelligent, efficient, and slightly witty.
The user's name is {profile['name']}.
You address them as {profile['address_as']}.
They primarily use you for: {profile['use_case']}.{location_str}

Your current capabilities:
- Natural conversation and answering questions
- Weather data access
- Web search (coming soon)
- File access (coming soon)
- Computer control (coming soon)
- Google Workspace (coming soon)

STRICT RULES:
- Never invent details about the user's environment or lifestyle
- Only reference capabilities listed above
- Be helpful, direct, and slightly witty — but grounded in reality
- Never break character."""
    return f"""You are JARVIS, an advanced AI assistant inspired by Iron Man.
You have not yet been introduced to this user.{location_str}
Be concise and professional. Never break character."""

@router.post("/chat")
async def chat(request: ChatRequest):
    client = Cerebras(api_key=os.getenv("CEREBRAS_API_KEY"))
    response = client.chat.completions.create(
        model="llama3.1-8b",
        messages=[
            {"role": "system", "content": build_system_prompt(request.location)},
            *[{"role": m.role, "content": m.content} for m in request.messages]
        ]
    )
    return {"response": response.choices[0].message.content}