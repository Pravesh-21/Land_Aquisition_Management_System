from api.routers.auth import router as auth_router
from api.routers.protected import router as protected_router
from api.routers.users import router as users_router

__all__ = [
    "auth_router",
    "protected_router",
    "users_router",
]
