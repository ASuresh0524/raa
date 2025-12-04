# RAA Roadmap Notes

## Direct-to-Physician (D2P) Strategies

1. **Screen sweep memory** – prompt radiologists to open the entire patient context (images, prior reports, labs) so the Screen Intelligence Agent can snapshot everything locally without integrations.
2. **Clipboard / upload funnel** – allow users to paste or drop PDFs/screenshots; the local agent OCRs and merges them into the longitudinal graph.
3. **Model router** – orchestrate only FDA-cleared subsystems (lung nodule CAD, LI-RADS, etc.) so the co-pilot remains compliant while still delegating specialized analyses. Vendors like Ferrum could supply the clearinghouse of approved models.

## Voice-First Co-Pilot

- **Hands-free commands**: “Show prior from 2023”, “Summarize nodules”, “Insert Fleischner recommendation”.
- **Auto-reporting**: Longitudinal agent streams deltas directly into the report buffer or side drawer with zero clicks.
- **Navigation macros**: Voice intents trigger layout presets (tri-planar, MIP), window/level changes, or prior syncing.
- **Dictation overlay**: Agent listens for trigger phrases inside the dictated report and responds contextually (guidelines, missing comparison statements).

## Timing & Observability

- Capture latency for data capture vs. agent reasoning so we can budget on-device processing and show low-latency proof during demos.
- Surface these metrics in the UI header (already wired into the demo).

## Next Experiments

- Expand the `/api/voice` endpoint with richer intent parsing (speech → semantic parse → action plan).
- Add “memory slots” per patient so agents can recall context even if the radiologist switches studies mid-exam.
- Prototype auto-population of structured report sections using the existing drafting agent output plus voice confirmations.

