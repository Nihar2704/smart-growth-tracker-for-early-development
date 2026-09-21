from app.routers.auth import router as auth_router
from app.routers.children import router as children_router
from app.routers.growth import router as growth_router
from app.routers.milestones import router as milestones_router
from app.routers.predictions import router as predictions_router

__all__ = ["auth_router", "children_router", "growth_router", "milestones_router", "predictions_router"]



