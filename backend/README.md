# Best4Life Backend

This is a **minimal learning backend** for Best4Life.

It supports authentication plus authenticated Best4Life data endpoints:

- `GET /health`
- `POST /auth/signup`
- `POST /auth/login`
- `GET /profile`
- `PUT /profile`
- `GET /meal-plans`
- `POST /meal-plans`
- `GET /meal-plans/latest`
- `GET /shopping-lists`
- `POST /shopping-lists`
- `GET /app/state`

It uses **FastAPI** and calls **Supabase Auth REST API** with `httpx`.

> Note: This learning version keeps security simple.
> In production, tokens should be verified properly (JWT signature/JWKS, etc.).

---

## Project structure

```text
backend/
  app/
    __init__.py
    main.py
    config.py
    supabase_auth.py
    models.py
  requirements.txt
  .env.example
  README.md
```

---

## Environment variables

Create `backend/.env` from `.env.example`.

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
FRONTEND_ORIGIN=http://localhost:5173
```

- `SUPABASE_URL`: your Supabase project URL (for example `https://xyzcompany.supabase.co`)
- `SUPABASE_ANON_KEY`: your Supabase anon/public key
- `FRONTEND_ORIGIN`: React app origin for CORS

Do **not** commit real secrets.

---

## Run on Windows PowerShell

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload --port 8000
```

---

## API endpoints

### 1) Health

`GET /health`

Response:

```json
{
  "status": "ok"
}
```

PowerShell example:

```powershell
Invoke-RestMethod -Method Get http://localhost:8000/health
```

---

### 2) Signup

`POST /auth/signup`

Body:

```json
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "Hai Yen",
  "last_name": "Huynh"
}
```

This endpoint forwards to Supabase:

- `POST {SUPABASE_URL}/auth/v1/signup`

with user metadata:

- `first_name`
- `last_name`
- `full_name`

If email confirmation is enabled in Supabase, signup may return no session. In that case, the backend returns a clear message.

PowerShell example:

```powershell
Invoke-RestMethod -Method Post http://localhost:8000/auth/signup `
  -ContentType "application/json" `
  -Body '{
    "email": "user@example.com",
    "password": "password123",
    "first_name": "Hai Yen",
    "last_name": "Huynh"
  }'
```

---

### 3) Login

`POST /auth/login`

Body:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

This endpoint forwards to Supabase:

- `POST {SUPABASE_URL}/auth/v1/token?grant_type=password`

and returns:

- `access_token`
- `refresh_token`
- `expires_in`
- `token_type`
- `user`

Save the returned `access_token`. You will use it for authenticated endpoints.

PowerShell example:

```powershell
Invoke-RestMethod -Method Post "http://localhost:8000/auth/login" `
  -ContentType "application/json" `
  -Body '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

---

### 4) Authenticated Best4Life endpoints

These endpoints require:

```http
Authorization: Bearer <access_token>
```

In Swagger docs (`/docs`):

1. Call `POST /auth/login` first.
2. Copy `access_token` from the response.
3. Click **Authorize**.
4. Paste either:
   - `Bearer <access_token>`
   - or just `<access_token>` (Swagger may auto-add Bearer)
5. Click **Authorize** and then **Close**.

#### 4.1) Profile

- `GET /profile`: get current user's profile from `public.profiles`.
- `PUT /profile`: update current user's profile/onboarding fields.

Example body for `PUT /profile`:

```json
{
  "first_name": "Hai Yen",
  "last_name": "Huynh",
  "full_name": "Hai Yen Huynh",
  "height": 168,
  "weight": 62,
  "age": 24,
  "gender": "female",
  "allergies": ["peanuts"],
  "dietary_preferences": ["high-protein"],
  "cuisine_preferences": ["Vietnamese", "Mediterranean"],
  "health_goal": "muscle gain",
  "activity_level": "moderate",
  "budget": 130,
  "is_profile_complete": true
}
```

#### 4.2) Meal plans

- `GET /meal-plans`: list all current user's meal plans from `public.meal_plans`.
- `POST /meal-plans`: save a new meal plan for current user.
- `GET /meal-plans/latest`: get newest saved meal plan for current user.

Example body for `POST /meal-plans`:

```json
{
  "title": "Week 1 Plan",
  "preferences": {
    "goal": "muscle gain",
    "budget": 130
  },
  "weekly_plan": {
    "monday": {
      "breakfast": "Oats with yogurt"
    }
  },
  "estimated_total_cost": 118.5,
  "total_calories": 14500,
  "total_protein": 720,
  "status": "saved"
}
```

#### 4.3) Shopping lists

- `GET /shopping-lists`: list all current user's shopping lists from `public.shopping_lists`.
- `POST /shopping-lists`: save shopping list + supermarket comparison for current user.

Example body for `POST /shopping-lists`:

```json
{
  "title": "Week 1 Groceries",
  "meal_plan_id": null,
  "items": [
    {"name": "Chicken breast", "quantity": 2, "unit": "kg"},
    {"name": "Rice", "quantity": 5, "unit": "kg"}
  ],
  "supermarket_totals": {
    "Woolworths": 87.2,
    "Coles": 84.9,
    "ALDI": 78.4
  },
  "cheapest_store": "ALDI",
  "cheapest_combination": [
    {"item": "Chicken breast", "store": "ALDI", "price": 22.5}
  ],
  "estimated_total_cost": 78.4,
  "selected_supermarket": "ALDI",
  "selected_suburb": "Parramatta"
}
```

#### 4.4) App state bootstrap

- `GET /app/state`: load all saved Best4Life app data after login.

Response shape:

```json
{
  "profile": {},
  "meal_plans": [],
  "latest_meal_plan": {},
  "shopping_lists": []
}
```

---

## Quick Swagger test flow

1. Start/restart backend:

```powershell
cd backend
uvicorn app.main:app --reload --port 8000
```

2. Open Swagger: `http://127.0.0.1:8000/docs`
3. Run `POST /auth/login` and copy `access_token`
4. Click **Authorize** and provide bearer token
5. Test all protected endpoints:
   - `GET /profile`
   - `PUT /profile`
   - `GET /meal-plans`
   - `POST /meal-plans`
   - `GET /meal-plans/latest`
   - `GET /shopping-lists`
   - `POST /shopping-lists`
   - `GET /app/state`

If everything is wired correctly, Swagger should show all 11 endpoints listed at the top of this README.

---

## Tiny optional frontend helper example (do not copy automatically)

Example file for later: `src/lib/backendApi.ts`

```ts
export async function signup(payload: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}) {
  const response = await fetch("http://localhost:8000/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return response.json();
}

export async function login(payload: { email: string; password: string }) {
  const response = await fetch("http://localhost:8000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return response.json();
}
```

This is only an example snippet. The React frontend was not modified.
