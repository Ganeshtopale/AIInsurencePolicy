import logging
from datetime import datetime, timedelta, timezone
from typing import List, Optional

logger = logging.getLogger(__name__)


class UserActivity:
    def __init__(self, user_id: int, email: str, name: str,
                 last_active_at: datetime, conversation_logs: Optional[List[str]] = None,
                 phone: Optional[str] = None):
        self.user_id = user_id
        self.email = email
        self.name = name
        self.last_active_at = last_active_at
        self.conversation_logs = conversation_logs or []
        self.phone = phone


def check_inactive_users(
    users: List[UserActivity],
    inactivity_days: int = 7,
) -> List[UserActivity]:
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(days=inactivity_days)
    inactive = [u for u in users if u.last_active_at < cutoff]
    logger.info("Found %d users inactive for > %d days", len(inactive), inactivity_days)
    return inactive


def generate_conversation_summary(user: UserActivity) -> str:
    if not user.conversation_logs:
        return f"{user.name} had no prior conversations."

    total_logs = len(user.conversation_logs)
    recent_logs = user.conversation_logs[-3:]

    summary_parts = [
        f"Conversation Summary for {user.name}",
        f"Total interactions: {total_logs}",
        f"Last active: {user.last_active_at.strftime('%Y-%m-%d %H:%M UTC')}",
    ]

    if recent_logs:
        summary_parts.append("Recent topics:")
        for log in recent_logs:
            summary_parts.append(f"  - {log[:120]}")

    summary_parts.append("Status: User has gone inactive. Follow-up recommended.")
    summary = "\n".join(summary_parts)

    logger.info("Generated conversation summary for user %s", user.user_id)
    return summary


def send_follow_up(
    user: UserActivity,
    channel: str = "email",
    summary: Optional[str] = None,
) -> dict:
    if summary is None:
        summary = generate_conversation_summary(user)

    from app.services.email_service import send_email

    subject = "We Miss You — Here's What You Missed"
    body = f"""
    <html><body>
    <h2>Hi {user.name},</h2>
    <p>We noticed you haven't visited us in a while. We have new insurance options that might interest you.</p>
    <hr/>
    <pre style="background:#f5f5f5;padding:10px;border-radius:4px;">{summary}</pre>
    <hr/>
    <p><a href="https://insurancemarketplace.com/dashboard" style="background:#007bff;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;">Return to Dashboard</a></p>
    <br/>
    <p>Best regards,<br/>The Insurance Marketplace Team</p>
    </body></html>
    """

    if channel == "whatsapp":
        logger.info("MOCK WhatsApp message to %s: %s", user.phone or user.email, subject)
        delivery_status = "whatsapp_queued"
    elif channel == "email":
        email_sent = send_email(user.email, subject, body)
        delivery_status = "email_sent" if email_sent else "email_failed"
    else:
        delivery_status = f"unsupported_channel:{channel}"

    result = {
        "user_id": user.user_id,
        "name": user.name,
        "email": user.email,
        "channel": channel,
        "subject": subject,
        "delivery_status": delivery_status,
        "sent_at": datetime.now(timezone.utc).isoformat(),
    }

    logger.info("Follow-up %s for user %s", delivery_status, user.user_id)
    return result


def run_inactive_user_workflow(
    users: List[UserActivity],
    inactivity_days: int = 7,
    channel: str = "email",
) -> List[dict]:
    results = []
    inactive = check_inactive_users(users, inactivity_days)

    for user in inactive:
        summary = generate_conversation_summary(user)
        result = send_follow_up(user, channel=channel, summary=summary)
        results.append(result)

    return results
