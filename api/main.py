"""Booking API for the PHX India website.

Receives "Book a shoot" inquiries from the contact form, validates them
server-side, stores them as JSON lines on disk, and (optionally) forwards
them by email when SMTP settings are configured via environment variables.

The static site never hard-depends on this service: the form falls back to
a pre-filled mailto: link when the API is unreachable.

Run locally:
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8001
"""

from __future__ import annotations

import json
import os
import secrets
import smtplib
from datetime import datetime, timezone
from email.message import EmailMessage
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field

INBOX_PATH = Path(os.environ.get("PHX_INBOX", "data/bookings.jsonl"))
ALLOWED_ORIGINS = os.environ.get(
    "PHX_ALLOWED_ORIGINS", "https://phxindia.com"
).split(",")

app = FastAPI(
    title="PHX India Booking API",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type"],
)


class Booking(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    email: EmailStr
    phone: str = Field(default="", max_length=40)
    service: str = Field(default="", max_length=80)
    location: str = Field(default="", max_length=200)
    message: str = Field(min_length=10, max_length=5000)


class BookingReceipt(BaseModel):
    reference: str
    received_at: str


def store(booking: Booking, reference: str, received_at: str) -> None:
    INBOX_PATH.parent.mkdir(parents=True, exist_ok=True)
    record = {"reference": reference, "received_at": received_at, **booking.model_dump()}
    with INBOX_PATH.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(record, ensure_ascii=False) + "\n")


def forward_by_email(booking: Booking, reference: str) -> None:
    """Send the inquiry onward if SMTP is configured; silently skip if not.

    Configure with: PHX_SMTP_HOST, PHX_SMTP_PORT, PHX_SMTP_USER,
    PHX_SMTP_PASSWORD, PHX_MAIL_TO (defaults to mailbox@phxindia.in).
    """
    host = os.environ.get("PHX_SMTP_HOST")
    if not host:
        return
    msg = EmailMessage()
    msg["Subject"] = f"Shoot inquiry {reference} — {booking.name}"
    msg["From"] = os.environ.get("PHX_SMTP_USER", "noreply@phxindia.in")
    msg["To"] = os.environ.get("PHX_MAIL_TO", "mailbox@phxindia.in")
    msg.set_content(
        f"Name: {booking.name}\n"
        f"Email: {booking.email}\n"
        f"Phone: {booking.phone or '—'}\n"
        f"Service: {booking.service or '—'}\n"
        f"Location: {booking.location or '—'}\n\n"
        f"{booking.message}\n"
    )
    port = int(os.environ.get("PHX_SMTP_PORT", "587"))
    with smtplib.SMTP(host, port) as smtp:
        smtp.starttls()
        user = os.environ.get("PHX_SMTP_USER")
        password = os.environ.get("PHX_SMTP_PASSWORD")
        if user and password:
            smtp.login(user, password)
        smtp.send_message(msg)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/booking", response_model=BookingReceipt)
def create_booking(booking: Booking) -> BookingReceipt:
    reference = f"PHX-{secrets.token_hex(4).upper()}"
    received_at = datetime.now(timezone.utc).isoformat()
    try:
        store(booking, reference, received_at)
    except OSError as exc:
        raise HTTPException(status_code=503, detail="Storage unavailable") from exc
    try:
        forward_by_email(booking, reference)
    except Exception:
        # Email forwarding is best-effort; the inquiry is already on disk.
        pass
    return BookingReceipt(reference=reference, received_at=received_at)
