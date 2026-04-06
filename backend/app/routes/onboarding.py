from fastapi import APIRouter
from pydantic import BaseModel
from app.memory.profile import get_profile, save_profile, is_onboarded

router = APIRouter()

class OnboardingData(BaseModel):
    name: str
    address_as: str
    use_case: str

@router.get("/onboarding/status")
def onboarding_status():
    return {"onboarded": is_onboarded()}

@router.post("/onboarding/complete")
def complete_onboarding(data: OnboardingData):
    save_profile(data.name, data.address_as, data.use_case)
    return {"status": "success"}

@router.get("/onboarding/profile")
def profile():
    return get_profile()