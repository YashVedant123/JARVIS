from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.routes.chat import router as chat_router
from app.routes.onboarding import router as onboarding_router
from app.routes.search import router as search_router
from app.memory.database import init_db

load_dotenv()

app = FastAPI(title="JARVIS")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(onboarding_router)
app.include_router(search_router)

@app.on_event("startup")
def startup():
    init_db()

@app.get("/")
def root():
    return {"status": "JARVIS online"}