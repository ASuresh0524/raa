"""
Credentialing-related outbound email.

Uses SMTP when SMTP_HOST is set; otherwise logs the message (safe local default).
Configure via environment variables (see README).
"""
from __future__ import annotations

import html as html_module
import logging
import os
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

from .models import Passport, QualityReport, Workflow

logger = logging.getLogger(__name__)


def smtp_configured() -> bool:
    return bool(os.getenv("SMTP_HOST", "").strip())


def _smtp_from() -> str:
    return os.getenv("SMTP_FROM", os.getenv("SMTP_USER", "credentialing@localhost"))


def send_html_email(to: str, subject: str, text_body: str, html_body: str) -> tuple[str, str]:
    """
    Send multipart email. Returns (status, message) where status is sent|logged|failed.
    """
    if not smtp_configured():
        logger.info(
            "Email (log-only; set SMTP_HOST to send): to=%s subject=%s\n%s",
            to,
            subject,
            text_body[:2000],
        )
        return "logged", "SMTP not configured — message logged server-side only."

    host = os.getenv("SMTP_HOST", "").strip()
    port = int(os.getenv("SMTP_PORT", "587"))
    user = os.getenv("SMTP_USER", "").strip()
    password = os.getenv("SMTP_PASSWORD", "").strip()
    use_ssl = os.getenv("SMTP_SSL", "").lower() in ("1", "true", "yes")
    use_tls = os.getenv("SMTP_USE_TLS", "true").lower() in ("1", "true", "yes")
    mail_from = _smtp_from()

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = mail_from
    msg["To"] = to
    msg.attach(MIMEText(text_body, "plain", "utf-8"))
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    try:
        if use_ssl or port == 465:
            context = ssl.create_default_context()
            with smtplib.SMTP_SSL(host, port, context=context) as server:
                if user:
                    server.login(user, password)
                server.sendmail(mail_from, [to], msg.as_string())
        else:
            with smtplib.SMTP(host, port, timeout=30) as server:
                if use_tls:
                    server.starttls(context=ssl.create_default_context())
                if user:
                    server.login(user, password)
                server.sendmail(mail_from, [to], msg.as_string())
        return "sent", f"Message queued to {to}"
    except Exception as e:  # noqa: BLE001
        logger.exception("SMTP send failed")
        return "failed", str(e)


def _npi(p: Passport) -> str:
    for loc in p.enrollment.practice_locations:
        if loc.npi:
            return loc.npi
    return "—"


def build_passport_summary_email(
    passport: Passport,
    template: str,
    workflow: Optional[Workflow] = None,
    note: Optional[str] = None,
) -> tuple[str, str, str]:
    """Returns (subject, text_body, html_body)."""
    name = passport.identity.legal_name
    cid = passport.clinician_id
    npi = _npi(passport)
    specs = ", ".join(passport.enrollment.specialties[:3]) if passport.enrollment.specialties else "—"
    lic = passport.licenses.state_licenses[0] if passport.licenses.state_licenses else None
    lic_line = f"{lic.state} #{lic.license_number}" if lic else "No license on file"

    if template == "workflow_complete":
        subject = f"Credentialing update: workflow complete — {name}"
        wf_bit = ""
        if workflow:
            wf_bit = (
                f"\nWorkflow: {workflow.workflow_id}\n"
                f"Destination: {workflow.destination_id} ({workflow.destination_type})\n"
                f"Status: {workflow.status.value}\n"
            )
        text = (
            f"This is an automated message from Credentialing Passport.\n\n"
            f"Clinician: {name}\n"
            f"Clinician ID: {cid}\n"
            f"NPI: {npi}\n"
            f"Specialties: {specs}\n"
            f"Primary license (sample): {lic_line}\n"
            f"{wf_bit}\n"
            f"The credentialing workflow has finished processing. "
            f"Review exceptions and evidence in your organization portal.\n"
        )
    elif template == "credentialing_nudge":
        subject = f"Action needed: credentialing passport — {name}"
        text = (
            f"Hello,\n\n"
            f"{name} ({cid}) has items pending in their credentialing passport.\n"
            f"NPI: {npi} · {specs}\n"
            f"License snapshot: {lic_line}\n\n"
            f"Please log in to complete outstanding attestations or uploads.\n"
        )
    else:
        subject = f"Credentialing passport summary — {name}"
        text = (
            f"Credentialing Passport summary\n\n"
            f"Clinician: {name}\n"
            f"ID: {cid}\n"
            f"NPI: {npi}\n"
            f"Specialties: {specs}\n"
            f"License: {lic_line}\n"
        )

    if note:
        text += f"\nNote: {note}\n"

    wf_html = ""
    if workflow:
        wf_html = (
            f"<p><strong>Workflow</strong> {workflow.workflow_id}<br/>"
            f"Destination: {workflow.destination_id} ({workflow.destination_type})<br/>"
            f"Status: {workflow.status.value}</p>"
        )

    note_html = f"<p><em>{note}</em></p>" if note else ""

    html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head><body style="font-family:system-ui,sans-serif;max-width:560px;">
  <h2 style="color:#1e3a5f;">Credentialing Passport</h2>
  <p><strong>{name}</strong><br/>
  Clinician ID: <code>{cid}</code><br/>
  NPI: {npi}<br/>
  Specialties: {specs}<br/>
  License: {lic_line}</p>
  {wf_html}
  {note_html}
  <p style="color:#64748b;font-size:13px;">Demo / automated message — do not reply.</p>
</body></html>"""

    return subject, text, html


def build_employer_missing_docs_email(
    passport: Passport,
    quality: QualityReport,
    workflow: Optional[Workflow] = None,
    note: Optional[str] = None,
) -> tuple[str, str, str]:
    """
    Email to employer / medical staff office listing gaps from pre-flight quality check.
    """
    name = passport.identity.legal_name
    cid = passport.clinician_id
    npi = _npi(passport)
    issues = quality.issues or []

    subject = f"Credentialing: documents / data needed for {name}"
    text_lines = [
        "This is an automated request from Credentialing Passport on behalf of the clinician.",
        "",
        f"Clinician: {name}",
        f"Clinician ID: {cid}",
        f"NPI: {npi}",
        f"Passport completeness (demo): {quality.completeness_score:.0f}%",
        "",
    ]
    if workflow:
        text_lines.extend(
            [
                f"Related workflow: {workflow.workflow_id}",
                f"Destination: {workflow.destination_id} ({workflow.destination_type})",
                "",
            ]
        )

    if issues:
        text_lines.append("Pre-flight findings — please provide or confirm:")
        for i in issues:
            fix = f" Suggested: {i.suggested_fix}" if i.suggested_fix else ""
            text_lines.append(f"  • [{i.severity.upper()}] {i.description}{fix}")
    else:
        text_lines.append("Pre-flight check: no open quality issues flagged (demo).")

    if note:
        text_lines.extend(["", f"Note: {note}"])
    text_lines.extend(["", "Thank you,", "Credentialing Passport (demo)"])
    text_body = "\n".join(text_lines)

    li_html = ""
    for i in issues:
        desc = html_module.escape(i.description)
        sev = html_module.escape(i.severity)
        fix = html_module.escape(i.suggested_fix or "")
        fix_html = f'<br/><span style="font-size:12px;color:#64748b;">Suggested: {fix}</span>' if fix else ""
        li_html += f'<li style="margin-bottom:10px;"><strong>{sev}</strong> — {desc}{fix_html}</li>'

    if not li_html:
        li_html = "<li>No open issues flagged by the pre-flight agent (demo).</li>"

    wf_html = ""
    if workflow:
        wf_html = (
            f"<p><strong>Workflow</strong> {html_module.escape(workflow.workflow_id)} — "
            f"{html_module.escape(workflow.destination_id)} ({html_module.escape(workflow.destination_type)})</p>"
        )
    note_html = f"<p><em>{html_module.escape(note)}</em></p>" if note else ""

    html_body = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head><body style="font-family:system-ui,sans-serif;max-width:600px;">
  <h2 style="color:#1e3a5f;">Credentialing — employer / MSO request</h2>
  <p>Please help complete the items below for <strong>{html_module.escape(name)}</strong>
  (NPI {html_module.escape(npi)}, ID <code>{html_module.escape(cid)}</code>).</p>
  <p>Pre-flight completeness (demo): <strong>{quality.completeness_score:.0f}%</strong></p>
  {wf_html}
  <p><strong>Open items from automated pre-scan</strong></p>
  <ul style="padding-left:20px;">{li_html}</ul>
  {note_html}
  <p style="color:#64748b;font-size:13px;">Demo message — configure SMTP to deliver; otherwise logged server-side.</p>
</body></html>"""

    return subject, text_body, html_body
