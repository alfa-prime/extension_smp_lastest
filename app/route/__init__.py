from fastapi import APIRouter
from .health import router as health_router
from .extension import router as extension_router

router = APIRouter()
router.include_router(health_router)
router.include_router(extension_router)
