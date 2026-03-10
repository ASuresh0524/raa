"""
State-specific credentialing form mappings and population helpers.
"""
from __future__ import annotations

from typing import Dict, Any

from .models import Passport


def _base_fields(passport: Passport) -> Dict[str, Any]:
    identity = passport.identity
    primary_address = identity.address_history[0] if identity.address_history else None
    primary_license = passport.licenses.state_licenses[0] if passport.licenses.state_licenses else None
    primary_board = passport.board_certifications[0] if passport.board_certifications else None
    practice_location = passport.enrollment.practice_locations[0] if passport.enrollment.practice_locations else None

    return {
        "legal_name": identity.legal_name,
        "aliases": identity.aliases,
        "dob": identity.date_of_birth,
        "email": identity.email,
        "phone": identity.phone,
        "address": {
            "street": primary_address.street if primary_address else "",
            "city": primary_address.city if primary_address else "",
            "state": primary_address.state if primary_address else "",
            "zip": primary_address.zip_code if primary_address else "",
        },
        "license": {
            "state": primary_license.state if primary_license else "",
            "number": primary_license.license_number if primary_license else "",
            "status": primary_license.status.value if primary_license else "",
            "expiration": primary_license.expiration_date if primary_license else None,
        },
        "board": {
            "name": primary_board.board_name if primary_board else "",
            "specialty": primary_board.specialty if primary_board else "",
            "status": primary_board.status if primary_board else "",
        },
        "npi": practice_location.npi if practice_location else "",
        "taxonomies": practice_location.taxonomy_codes if practice_location else passport.enrollment.taxonomies,
        "ein": passport.enrollment.ein,
        "w9_on_file": passport.enrollment.w9_on_file,
    }


def populate_state_form(state: str, passport: Passport) -> Dict[str, Any]:
    """
    Populate state-specific form fields using the passport data.
    Returns a structure ready to render into PDFs/portals.
    """
    base = _base_fields(passport)

    state_upper = state.upper()
    if state_upper == "CA":
        return {
            "state": "CA",
            "form_name": "California Credentialing Packet",
            "fields": {
                "provider_full_name": base["legal_name"],
                "provider_npi": base["npi"],
                "provider_license_number": base["license"]["number"],
                "provider_license_state": "CA",
                "provider_email": base["email"],
                "provider_phone": base["phone"],
                "provider_address": base["address"],
                "taxonomy_codes": base["taxonomies"],
            },
        }
    if state_upper == "NY":
        return {
            "state": "NY",
            "form_name": "New York Credentialing Packet",
            "fields": {
                "provider_name": base["legal_name"],
                "npi": base["npi"],
                "license": base["license"]["number"],
                "address": base["address"],
                "primary_specialty": base["board"]["specialty"],
            },
        }
    if state_upper == "FL":
        return {
            "state": "FL",
            "form_name": "Florida Credentialing Packet",
            "fields": {
                "name": base["legal_name"],
                "npi": base["npi"],
                "license_number": base["license"]["number"],
                "dea_number": passport.licenses.dea_number or "",
                "mailing_address": base["address"],
            },
        }

    # Default (generic)
    return {
        "state": state_upper,
        "form_name": "Generic Credentialing Packet",
        "fields": base,
    }
