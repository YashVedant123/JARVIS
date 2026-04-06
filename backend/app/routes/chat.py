from fastapi import APIRouter
from pydantic import BaseModel
from cerebras.cloud.sdk import Cerebras
from tavily import TavilyClient
from app.memory.profile import get_profile
import os
import json

router = APIRouter()

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: list[Message]
    location: str | None = None

def build_system_prompt(location: str | None = None, search_results: str | None = None):
    profile = get_profile()
    location_str = f"\nThe user's current location is: {location}." if location else "\nYou do not have access to the user's location."
    search_str = f"\n\nWEB SEARCH RESULTS:\n{search_results}\nUse these results to answer the user's question accurately." if search_results else ""

    if profile:
        return f"""You are JARVIS, an advanced AI assistant inspired by Iron Man.
You are highly intelligent, efficient, and slightly witty.
The user's name is {profile['name']}.
You address them as {profile['address_as']}.
They primarily use you for: {profile['use_case']}.{location_str}{search_str}

Your current capabilities:
- Natural conversation and answering questions
- Weather data access
- Web search
- File access (coming soon)
- Computer control (coming soon)
- Google Workspace (coming soon)

STRICT RULES:
- Never invent details about the user's environment or lifestyle
- Only reference capabilities listed above
- Be helpful, direct, and slightly witty — but grounded in reality
- When you have search results, use them — don't say you can't access the internet
- Never break character."""
    return f"""You are JARVIS, an advanced AI assistant inspired by Iron Man.
You have not yet been introduced to this user.{location_str}{search_str}
Be concise and professional. Never break character."""

def should_search(query: str) -> bool:
    client = Cerebras(api_key=os.getenv("CEREBRAS_API_KEY"))
    response = client.chat.completions.create(
        model="llama3.1-8b",
        messages=[
            {"role": "system", "content": "You are a classifier. Respond with only 'YES' or 'NO'. Should this query require a web search to answer accurately? Answer YES for: current events, news, prices, weather, recent information, specific facts you might not know. Answer NO for: general conversation, math, coding help, personal questions."},
            {"role": "user", "content": query}
        ]
    )
    answer = response.choices[0].message.content.strip().upper()
    return "YES" in answer

def run_search(query: str) -> str:
    try:
        client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))
        results = client.search(query=query, max_results=5)
        formatted = []
        for r in results["results"]:
            formatted.append(f"Source: {r['url']}\n{r['content']}")
        return "\n\n".join(formatted)
    except Exception as e:
        return ""

@router.post("/chat")
async def chat(request: ChatRequest):
    client = Cerebras(api_key=os.getenv("CEREBRAS_API_KEY"))
    
    last_message = request.messages[-1].content if request.messages else ""
    
    search_results = None
    if should_search(last_message):
        search_results = run_search(last_message)
    
    response = client.chat.completions.create(
        model="llama3.1-8b",
        messages=[
            {"role": "system", "content": build_system_prompt(request.location, search_results)},
            *[{"role": m.role, "content": m.content} for m in request.messages]
        ]
    )
    
    return {
        "response": response.choices[0].message.content,
        "searched": search_results is not None
    }