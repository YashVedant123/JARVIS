from fastapi import APIRouter
from pydantic import BaseModel
from tavily import TavilyClient
import os

router = APIRouter()

class SearchRequest(BaseModel):
    query: str

@router.post("/search")
async def search(request: SearchRequest):
    client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))
    results = client.search(query=request.query, max_results=5)
    return {"results": results["results"]}