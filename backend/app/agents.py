"""
Rule-based demo agents that transform stub data into UI-ready suggestions.
"""
from collections import defaultdict
from typing import Iterable

from .models import (
    DraftingHint,
    GuidelineRecommendation,
    LongitudinalSummary,
    Measurement,
    Study,
)


def _group_measurements(measurements: Iterable[Measurement]) -> dict[str, list[Measurement]]:
    buckets: dict[str, list[Measurement]] = defaultdict(list)
    for measurement in measurements:
        buckets[measurement.lesion].append(measurement)
    for lesion in buckets:
        buckets[lesion].sort(key=lambda m: m.study_date)
    return buckets


def generate_longitudinal(studies: list[Study]) -> list[LongitudinalSummary]:
    groups = _group_measurements(m for s in studies for m in s.measurements)
    summaries: list[LongitudinalSummary] = []
    for lesion, measurements in groups.items():
        if len(measurements) < 2:
            continue
        baseline = measurements[0]
        latest = measurements[-1]
        delta = latest.value_mm - baseline.value_mm
        if abs(delta) < 0.5:
            trend = "stable"
        elif delta > 0:
            trend = "growth"
        else:
            trend = "decrease"

        deltas = [
            f"{m.study_date:%b %Y}: {m.value_mm:.1f} mm - {m.description}"
            for m in measurements
        ]
        narrative = (
            f"{lesion} changed by {delta:+.1f} mm since {baseline.study_date:%b %Y}."
        )
        summaries.append(
            LongitudinalSummary(
                lesion=lesion,
                trend=trend,
                narrative=narrative,
                deltas=deltas,
            )
        )
    return summaries


def generate_guideline_recs(studies: list[Study]) -> list[GuidelineRecommendation]:
    recs: list[GuidelineRecommendation] = []
    for study in studies:
        for measurement in study.measurements:
            if "nodule" in measurement.lesion.lower():
                if measurement.value_mm >= 6:
                    recs.append(
                        GuidelineRecommendation(
                            guideline="Fleischner (2017)",
                            condition="Solid pulmonary nodule ≥6 mm",
                            recommendation="Consider CT at 3–6 months, then at 18–24 months.",
                            citation_url="https://www.fleischnerguidelines.org",
                        )
                    )
                elif measurement.value_mm >= 4:
                    recs.append(
                        GuidelineRecommendation(
                            guideline="Fleischner (2017)",
                            condition="Solid pulmonary nodule 4–6 mm",
                            recommendation="Optional CT at 12 months depending on risk factors.",
                            citation_url="https://www.fleischnerguidelines.org",
                        )
                    )
            if "ground-glass" in measurement.description.lower():
                recs.append(
                    GuidelineRecommendation(
                        guideline="Fleischner (2017)",
                        condition="Pure ground-glass opacity ≥6 mm",
                        recommendation="CT at 6–12 months to confirm persistence, then q2 years up to 5 years.",
                        citation_url="https://www.fleischnerguidelines.org",
                    )
                )
    return recs


def generate_drafting_hints(studies: list[Study]) -> list[DraftingHint]:
    hints: list[DraftingHint] = []
    if not studies:
        return hints

    latest = max(studies, key=lambda s: s.study_date)
    findings = "; ".join(m.lesion for m in latest.measurements)
    hints.append(
        DraftingHint(
            section="Findings",
            suggestion=f"Comparison made to {latest.study_date:%b %Y} prior. Noted: {findings}.",
        )
    )
    if any(m.value_mm >= 6 for m in latest.measurements):
        hints.append(
            DraftingHint(
                section="Impression",
                suggestion="Emphasize interval growth of RUL nodule and recommend guideline-based follow-up.",
            )
        )
    return hints

