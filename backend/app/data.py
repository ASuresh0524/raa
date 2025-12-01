"""
Static stub data used to drive the demo UI.
"""
from datetime import date

from .models import Measurement, Study


def _make_measurements() -> list[Measurement]:
    return [
        Measurement(
            id="lesion-rul-2023",
            lesion="Right upper lobe nodule",
            value_mm=4.0,
            study_date=date(2023, 9, 12),
            description="Solid nodule with smooth margins",
        ),
        Measurement(
            id="lesion-rul-2024",
            lesion="Right upper lobe nodule",
            value_mm=6.2,
            study_date=date(2024, 11, 4),
            description="Slight spiculation, more conspicuous",
        ),
        Measurement(
            id="lesion-lll-2024",
            lesion="Left lower lobe ground-glass focus",
            value_mm=8.0,
            study_date=date(2024, 11, 4),
            description="Faint ground-glass opacity near pleura",
        ),
    ]


MEASUREMENTS = _make_measurements()

STUDIES = [
    Study(
        id="ct-chest-2023",
        body_part="Chest",
        modality="CT",
        study_date=date(2023, 9, 12),
        summary="Baseline CT chest with faint 4 mm RUL nodule.",
        measurements=[MEASUREMENTS[0]],
    ),
    Study(
        id="ct-chest-2024",
        body_part="Chest",
        modality="CT",
        study_date=date(2024, 11, 4),
        summary="Interval CT chest showing growth of RUL nodule and new ground-glass focus LLL.",
        measurements=[MEASUREMENTS[1], MEASUREMENTS[2]],
    ),
]


CURRENT_CASE_ID = "case-rad-001"

