# PHX Booking API

FastAPI service that receives "Book a shoot" inquiries from the contact form.

## Run

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

Endpoints: `POST /api/booking`, `GET /api/health`, docs at `/api/docs`.

## Configuration (environment variables)

| Variable | Default | Purpose |
|---|---|---|
| `PHX_INBOX` | `data/bookings.jsonl` | Where inquiries are appended (JSON lines) |
| `PHX_ALLOWED_ORIGINS` | `https://phxindia.com` | CORS, comma-separated |
| `PHX_SMTP_HOST` | *(unset → email off)* | SMTP relay for forwarding inquiries |
| `PHX_SMTP_PORT` | `587` | |
| `PHX_SMTP_USER` / `PHX_SMTP_PASSWORD` | *(unset)* | SMTP credentials — set at deploy time, never commit |
| `PHX_MAIL_TO` | `mailbox@phxindia.in` | Inquiry recipient |

The static site works without this service — the form falls back to a
pre-filled `mailto:` if the API is unreachable.
