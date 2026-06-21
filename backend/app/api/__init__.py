from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.chat import router as chat_router
from app.api.policies import router as policies_router
from app.api.leads import router as leads_router
from app.api.compare import router as compare_router
from app.api.checkout import router as checkout_router
from app.api.home import router as home_router
from app.api.jobs import router as jobs_router
from app.api.pages import router as pages_router
from app.api.admin import router as admin_router
from app.api.admin_providers import router as admin_providers_router
from app.api.user_profile import router as user_profile_router
from app.api.upload import router as upload_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(chat_router)
api_router.include_router(policies_router)
api_router.include_router(leads_router)
api_router.include_router(compare_router)
api_router.include_router(checkout_router)
api_router.include_router(home_router)
api_router.include_router(admin_router)
api_router.include_router(admin_providers_router)
api_router.include_router(jobs_router)
api_router.include_router(pages_router)
api_router.include_router(user_profile_router)
api_router.include_router(upload_router)
