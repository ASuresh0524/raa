export type Measurement = {
  id: string
  lesion: string
  value_mm: number
  study_date: string
  description: string
}

export type Study = {
  id: string
  body_part: string
  modality: 'CT' | 'MR' | 'XR'
  study_date: string
  summary: string
  measurements: Measurement[]
}

export type LongitudinalSummary = {
  lesion: string
  trend: 'stable' | 'growth' | 'decrease'
  narrative: string
  deltas: string[]
}

export type GuidelineRecommendation = {
  guideline: string
  condition: string
  recommendation: string
  citation_url: string
}

export type DraftingHint = {
  section: string
  suggestion: string
}

export type AgentPacket = {
  case_id: string
  studies: Study[]
  longitudinal: LongitudinalSummary[]
  guideline_recs: GuidelineRecommendation[]
  drafting_hints: DraftingHint[]
}

