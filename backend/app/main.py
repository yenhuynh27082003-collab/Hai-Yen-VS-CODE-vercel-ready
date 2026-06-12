"""Best4Life backend API with auth + user-scoped data endpoints."""

from typing import Any

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import get_settings
from app.models import (
    HealthResponse,
    LoginRequest,
    LoginResponse,
    MealPlanCreateRequest,
    ProfileUpdateRequest,
    ShoppingListCreateRequest,
    SignupRequest,
)
from app.supabase_auth import get_user_from_token, login_user, signup_user
from app.supabase_db import (
    create_meal_plan,
    create_shopping_list,
    get_latest_meal_plan,
    get_profile,
    list_meal_plans,
    list_shopping_lists,
    update_profile,
)


try:
    settings = get_settings()
except ValueError as exc:
    # Fail fast so students immediately see what is missing in backend/.env.
    raise RuntimeError(str(exc)) from exc


app = FastAPI(title="Best4Life Backend", version="0.1.0")
bearer_scheme = HTTPBearer(auto_error=False)

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]

if settings.frontend_origin and settings.frontend_origin.rstrip("/") not in allowed_origins:
    allowed_origins.append(settings.frontend_origin.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https?://(localhost|127.0.0.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(status="ok")


@app.post("/auth/signup")
async def signup(request: SignupRequest) -> dict[str, Any]:
    payload = {
        "email": request.email,
        "password": request.password,
        # Supabase Auth expects user metadata in "data".
        "data": {
            "first_name": request.first_name,
            "last_name": request.last_name,
            "full_name": f"{request.first_name} {request.last_name}",
        },
    }

    result = await signup_user(settings=settings, payload=payload)

    # If email confirmation is enabled, session may be null on signup.
    if not result.get("session"):
        result["message"] = (
            "Signup succeeded, but no session was returned. "
            "This usually means email confirmation is enabled in Supabase. "
            "Please confirm your email before logging in."
        )

    # In production, tokens should be verified properly (JWT/JWKS validation).
    return result


@app.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest) -> LoginResponse:
    payload = {
        "email": request.email,
        "password": request.password,
    }

    result = await login_user(settings=settings, payload=payload)

    required_fields = ["access_token", "refresh_token", "expires_in", "token_type", "user"]
    missing = [field for field in required_fields if field not in result]
    if missing:
        raise HTTPException(
            status_code=502,
            detail=f"Supabase login response missing expected fields: {', '.join(missing)}",
        )

    # In production, tokens should be verified properly (JWT/JWKS validation).
    return LoginResponse(
        access_token=result["access_token"],
        refresh_token=result["refresh_token"],
        expires_in=result["expires_in"],
        token_type=result["token_type"],
        user=result["user"],
    )


async def require_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict[str, Any]:
    if not credentials or credentials.scheme.lower() != "bearer" or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header. Use: Bearer <access_token>",
        )

    access_token = credentials.credentials
    user = await get_user_from_token(settings=settings, access_token=access_token)
    return {
        "access_token": access_token,
        "user": user,
        "user_id": user["id"],
    }


@app.get("/profile")
async def get_current_profile(
    auth_context: dict[str, Any] = Depends(require_current_user),
) -> dict[str, Any]:
    profile = await get_profile(
        settings=settings,
        access_token=auth_context["access_token"],
        user_id=auth_context["user_id"],
    )
    return profile or {}


@app.put("/profile")
async def put_current_profile(
    request: ProfileUpdateRequest,
    auth_context: dict[str, Any] = Depends(require_current_user),
) -> dict[str, Any]:
    updates = request.model_dump(exclude_none=True)
    if not updates:
        return await get_current_profile(auth_context=auth_context)

    profile = await update_profile(
        settings=settings,
        access_token=auth_context["access_token"],
        user_id=auth_context["user_id"],
        profile_updates=updates,
    )
    return profile or {}


@app.get("/meal-plans")
async def get_meal_plans(
    auth_context: dict[str, Any] = Depends(require_current_user),
) -> list[dict[str, Any]]:
    return await list_meal_plans(
        settings=settings,
        access_token=auth_context["access_token"],
        user_id=auth_context["user_id"],
    )


@app.post("/meal-plans")
async def post_meal_plan(
    request: MealPlanCreateRequest,
    auth_context: dict[str, Any] = Depends(require_current_user),
) -> dict[str, Any]:
    return await create_meal_plan(
        settings=settings,
        access_token=auth_context["access_token"],
        user_id=auth_context["user_id"],
        payload=request.model_dump(),
    )


@app.get("/meal-plans/latest")
async def get_latest_saved_meal_plan(
    auth_context: dict[str, Any] = Depends(require_current_user),
) -> dict[str, Any]:
    latest = await get_latest_meal_plan(
        settings=settings,
        access_token=auth_context["access_token"],
        user_id=auth_context["user_id"],
    )
    return latest or {}


@app.get("/shopping-lists")
async def get_shopping_lists(
    auth_context: dict[str, Any] = Depends(require_current_user),
) -> list[dict[str, Any]]:
    return await list_shopping_lists(
        settings=settings,
        access_token=auth_context["access_token"],
        user_id=auth_context["user_id"],
    )


@app.post("/shopping-lists")
async def post_shopping_list(
    request: ShoppingListCreateRequest,
    auth_context: dict[str, Any] = Depends(require_current_user),
) -> dict[str, Any]:
    return await create_shopping_list(
        settings=settings,
        access_token=auth_context["access_token"],
        user_id=auth_context["user_id"],
        payload=request.model_dump(),
    )


@app.get("/app/state")
async def get_app_state(
    auth_context: dict[str, Any] = Depends(require_current_user),
) -> dict[str, Any]:
    profile = await get_profile(
        settings=settings,
        access_token=auth_context["access_token"],
        user_id=auth_context["user_id"],
    )
    meal_plans = await list_meal_plans(
        settings=settings,
        access_token=auth_context["access_token"],
        user_id=auth_context["user_id"],
    )
    latest_meal_plan = meal_plans[0] if meal_plans else {}
    shopping_lists = await list_shopping_lists(
        settings=settings,
        access_token=auth_context["access_token"],
        user_id=auth_context["user_id"],
    )

    return {
        "profile": profile or {},
        "meal_plans": meal_plans,
        "latest_meal_plan": latest_meal_plan,
        "shopping_lists": shopping_lists,
    }
