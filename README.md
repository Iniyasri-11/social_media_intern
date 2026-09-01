# AI-Based Post Authenticity Verification System — Backend Foundation

This is the backend foundation for the MVP: a clean, modular FastAPI
project with a working `POST /verify` endpoint that currently returns a
**dummy response**. No AI models, image processing, or database are wired
in yet — that comes in later phases.

## Run locally

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Then open:
- http://127.0.0.1:8000/docs — Swagger UI (try the `/verify` endpoint here)
- http://127.0.0.1:8000/redoc — ReDoc UI
- http://127.0.0.1:8000/ — health check

## Run tests

```bash
pytest tests/
```

## Project structure

```
app/
├── main.py           # FastAPI app instance, metadata, router registration
├── routes/
│   └── verify.py       # POST /verify endpoint definition
├── schemas/
│   └── verify.py        # Pydantic request/response models
├── services/
│   └── verification_service.py   # business logic (dummy for now)
└── static/            # reserved for a frontend later

models/                # reserved for ML model loading (empty for now)
scoring/               # reserved for verdict-scoring logic (empty for now)
data/                  # reserved for sample/test data
tests/
└── test_verify.py      # tests for the /verify endpoint
```

## Design notes

- **Routers, not routes-on-app**: `app/routes/verify.py` defines an
  `APIRouter` included into the main app, so `main.py` stays a thin
  wiring layer as more feature areas are added.
- **Service layer separation**: `app/routes/verify.py` calls
  `app/services/verification_service.py` rather than containing logic
  itself. When real AI models are added, only the service layer needs to
  change — routes and schemas stay stable.
- **Pydantic schemas as the contract**: `app/schemas/verify.py` defines
  exactly what a request/response looks like, which FastAPI uses for
  validation and for the Swagger docs.

## Status

- [x] FastAPI app with project metadata
- [x] Modular router structure
- [x] `POST /verify` with Pydantic validation
- [x] Dummy response wired end-to-end
- [x] Tests passing, runnable via Swagger UI
- [ ] Real text authenticity model (next phase)
- [ ] Image metadata + reverse image search (next phase)
- [ ] Real weighted scoring logic in `scoring/` (next phase)
- Backend foundation documentation updated
