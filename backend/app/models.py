"""Pydantic models for request and response payloads."""

from typing import Any

from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)


class HealthResponse(BaseModel):
    status: str


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    expires_in: int
    token_type: str
    user: dict[str, Any]


class ProfileUpdateRequest(BaseModel):
    first_name: str | None = Field(default=None, min_length=1, max_length=100)
    last_name: str | None = Field(default=None, min_length=1, max_length=100)
    full_name: str | None = Field(default=None, min_length=1, max_length=200)
    height: float | None = None
    weight: float | None = None
    age: int | None = Field(default=None, ge=0)
    gender: str | None = Field(default=None, max_length=50)
    allergies: list[str] | None = None
    dietary_preferences: list[str] | None = None
    cuisine_preferences: list[str] | None = None
    health_goal: str | None = Field(default=None, max_length=200)
    activity_level: str | None = Field(default=None, max_length=100)
    budget: float | None = None
    is_profile_complete: bool | None = None


class MealPlanCreateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    preferences: dict[str, Any] = Field(default_factory=dict)
    weekly_plan: dict[str, Any]
    estimated_total_cost: float | None = None
    total_calories: int | None = None
    total_protein: float | None = None
    status: str = Field(default="draft", max_length=50)


class ShoppingListCreateRequest(BaseModel):
    meal_plan_id: str | None = None
    title: str = Field(min_length=1, max_length=200)
    items: list[dict[str, Any]] = Field(default_factory=list)
    supermarket_totals: dict[str, Any] = Field(default_factory=dict)
    cheapest_store: str | None = Field(default=None, max_length=200)
    cheapest_combination: list[dict[str, Any]] = Field(default_factory=list)
    estimated_total_cost: float | None = None
    selected_supermarket: str | None = Field(default=None, max_length=200)
    selected_suburb: str | None = Field(default=None, max_length=200)
