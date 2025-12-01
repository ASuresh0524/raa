"""
Pydantic models used by the Radiology Action Assistant demo backend.
"""
from datetime import date
from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class Measurement(BaseModel):
    """Structured representation of an on-screen measurement."""

    id: str
    lesion: str
    value_mm: float = Field(..., description="Lesion size in millimeters")
    study_date: date
    description: str


class Study(BaseModel):
    """Minimal study representation for the demo."""

    id: str
    body_part: str
    modality: Literal["CT", "MR", "XR"]
    study_date: date
    summary: str
    measurements: List[Measurement] = Field(default_factory=list)


class GuidelineRecommendation(BaseModel):
    """Recommendation surfaced by the guideline agent."""

    guideline: str
    condition: str
    recommendation: str
    citation_url: str


class DraftingHint(BaseModel):
    """Textual hints for dictation/report drafting."""

    section: str
    suggestion: str


class LongitudinalSummary(BaseModel):
    """Output from the change-detection agent."""

    lesion: str
    trend: Literal["stable", "growth", "decrease"]
    narrative: str
    deltas: List[str]


class AgentPacket(BaseModel):
    """Container returned to the UI."""

    case_id: str
    studies: List[Study]
    longitudinal: List[LongitudinalSummary]
    guideline_recs: List[GuidelineRecommendation]
    drafting_hints: List[DraftingHint]

