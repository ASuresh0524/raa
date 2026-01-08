"""
Sample credentialing passport data for demo purposes.
"""
from datetime import date, datetime

from .models import (
    Address,
    BoardCertification,
    Education,
    Enrollment,
    Identity,
    Licenses,
    Malpractice,
    Passport,
    PracticeLocation,
    Reference,
    StateLicense,
    Training,
    WorkHistory,
    LicenseStatus,
)


def create_sample_passport() -> Passport:
    """Create a sample passport for demonstration."""
    identity = Identity(
        legal_name="Dr. Sarah Johnson",
        aliases=["Sarah J. Johnson", "S. Johnson"],
        date_of_birth=date(1985, 3, 15),
        email="sarah.johnson@example.com",
        phone="555-123-4567",
        address_history=[
            Address(
                street="123 Medical Center Dr",
                city="Boston",
                state="MA",
                zip_code="02115",
                start_date=date(2020, 1, 1),
            ),
            Address(
                street="456 Health Ave",
                city="Cambridge",
                state="MA",
                zip_code="02139",
                start_date=date(2015, 6, 1),
                end_date=date(2019, 12, 31),
            ),
        ],
    )

    education = [
        Education(
            institution="Harvard Medical School",
            degree="MD",
            field_of_study="Medicine",
            start_date=date(2007, 9, 1),
            end_date=date(2011, 5, 31),
            graduation_date=date(2011, 5, 31),
            verified=True,
        ),
    ]

    training = [
        Training(
            program_name="Internal Medicine Residency",
            institution="Massachusetts General Hospital",
            specialty="Internal Medicine",
            start_date=date(2011, 7, 1),
            end_date=date(2014, 6, 30),
            program_type="residency",
        ),
        Training(
            program_name="Cardiology Fellowship",
            institution="Brigham and Women's Hospital",
            specialty="Cardiology",
            start_date=date(2014, 7, 1),
            end_date=date(2017, 6, 30),
            program_type="fellowship",
        ),
    ]

    work_history = [
        WorkHistory(
            employer="Boston Cardiology Associates",
            position="Attending Cardiologist",
            start_date=date(2017, 7, 1),
            location="Boston, MA",
            verified=True,
        ),
        WorkHistory(
            employer="Massachusetts General Hospital",
            position="Cardiology Fellow",
            start_date=date(2014, 7, 1),
            end_date=date(2017, 6, 30),
            location="Boston, MA",
            verified=True,
        ),
    ]

    licenses = Licenses(
        state_licenses=[
            StateLicense(
                state="MA",
                license_number="MD123456",
                license_type="Medical Doctor",
                issue_date=date(2011, 6, 1),
                expiration_date=date(2025, 12, 31),
                status=LicenseStatus.ACTIVE,
                verified=True,
                verification_date=datetime(2024, 1, 15),
            ),
            StateLicense(
                state="NY",
                license_number="MD789012",
                license_type="Medical Doctor",
                issue_date=date(2012, 3, 1),
                expiration_date=date(2024, 12, 31),
                status=LicenseStatus.ACTIVE,
                verified=True,
                verification_date=datetime(2024, 1, 10),
            ),
        ],
        dea_number="BJ1234567",
        dea_expiration=date(2025, 6, 30),
        cds_registrations=["MA"],
    )

    board_certifications = [
        BoardCertification(
            board_name="American Board of Internal Medicine",
            specialty="Internal Medicine",
            certification_number="ABIM-123456",
            issue_date=date(2014, 9, 1),
            expiration_date=date(2024, 12, 31),
            status="active",
            moc_status="Current",
            verified=True,
        ),
        BoardCertification(
            board_name="American Board of Internal Medicine",
            specialty="Cardiovascular Disease",
            certification_number="ABIM-CV-123456",
            issue_date=date(2017, 9, 1),
            expiration_date=date(2027, 12, 31),
            status="active",
            moc_status="Current",
            verified=True,
        ),
    ]

    malpractice = Malpractice(
        carrier="Medical Protective Company",
        policy_number="MP-123456789",
        coverage_amount=1000000.0,
        effective_date=date(2024, 1, 1),
        expiration_date=date(2025, 1, 1),
        claims_history=[],
        loss_runs_available=True,
    )

    references = [
        Reference(
            name="Dr. Michael Chen",
            title="Chief of Cardiology",
            organization="Massachusetts General Hospital",
            email="mchen@mgh.harvard.edu",
            phone="555-234-5678",
            relationship="Former Program Director",
            verified=False,
        ),
        Reference(
            name="Dr. Emily Rodriguez",
            title="Attending Cardiologist",
            organization="Boston Cardiology Associates",
            email="erodriguez@bostoncardio.com",
            phone="555-345-6789",
            relationship="Colleague",
            verified=False,
        ),
    ]

    enrollment = Enrollment(
        practice_locations=[
            PracticeLocation(
                name="Boston Cardiology Associates - Main Office",
                address=Address(
                    street="123 Medical Center Dr",
                    city="Boston",
                    state="MA",
                    zip_code="02115",
                    start_date=date(2020, 1, 1),
                ),
                npi="1234567890",
                taxonomy_codes=["207RC0000X", "207RI0001X"],
            ),
        ],
        ein="12-3456789",
        w9_on_file=True,
        specialties=["Cardiology", "Internal Medicine"],
        taxonomies=["207RC0000X", "207RI0001X"],
    )

    return Passport(
        clinician_id="clinician-001",
        identity=identity,
        education=education,
        training=training,
        work_history=work_history,
        hospital_affiliations=[],
        licenses=licenses,
        board_certifications=board_certifications,
        malpractice=malpractice,
        disclosures=[],
        references=references,
        enrollment=enrollment,
        documents=[],
        created_at=datetime(2024, 1, 1),
        updated_at=datetime.utcnow(),
    )


SAMPLE_PASSPORT = create_sample_passport()
CURRENT_CLINICIAN_ID = "clinician-001"
