# Football AI

A data-driven football predictive-analytics and market-edge system.
**Not** a chatbot that gives opinions, and never a source of guaranteed
picks — every number here is a probability, calibrated and backtested, and
every claim about performance comes from an immutable, publicly
reconstructable prediction log. See `docs/MODEL.md` #8 and `docs/API.md`
for how "no certainty language" is enforced in code, not just copy.

This is a **separate product** scaffolded inside the SpeakUp-Web repository
under `football-ai/` — it does not touch or depend on the SpeakUp app that
otherwise lives in this repo.

## Status

Phases 0–1 (research, architecture) are complete. Phases 3, 5, 7, 9, 10, 11,
12 are scaffolded with real, tested code that works today on synthetic
data. Phases 2, 6, 8's final model choice, and 13–14 are genuinely not
started — they require a live data contract or a trained model against real
history, neither of which exists yet. See `ROADMAP.md` for the exact
per-phase status and what "done" means for each item — nothing here is
faked to look further along than it is (brief Section 27).

## Read first

1. `docs/research/DATA_PROVIDERS.md` — Phase 0: which data providers were
   compared, and why the chosen combination was chosen.
2. `docs/ARCHITECTURE.md` — component diagram, repo layout, core design
   invariants (LLM never computes probabilities, no data leakage, immutable
   predictions).
3. `ROADMAP.md` — phase-by-phase status.

Then, depending on what you're touching: `docs/DATA.md`, `docs/MODEL.md`,
`docs/BACKTESTING.md`, `docs/MARKET_ENGINE.md`, `docs/COMBINATIONS.md`,
`docs/API.md`, `docs/DEPLOYMENT.md`, `docs/EXPERIMENTS.md`.

## Run it locally

Backend:

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
pytest -q                 # 70+ unit tests for every stat module + service
uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Or both plus Postgres via Docker:

```bash
cp .env.example .env
docker compose -f infra/docker-compose.yml up --build
```

With no data ingested, the API and UI report explicit "no data yet" states
rather than fabricated matches, predictions, or edges — that is expected
and correct at this stage (see `ROADMAP.md` → "What 'done' means at each
phase in this repo right now").

## What's real right now vs. what's a placeholder

**Real, tested, working today** (unit-tested against synthetic/hand-computed
data, `backend/tests/`, 71 tests passing):
- Elo, independent Poisson, Dixon-Coles score matrices and derived markets
- Odds↔probability conversion, overround, normalization, EV
- Brier Score, Log Loss, calibration curves, Expected Calibration Error
- Platt scaling and isotonic regression calibration
- Monte Carlo simulation from a fitted joint score distribution
- Correlation-aware same-match joint probability (vs. naive independence)
- Walk-forward fold generation + fold scoring for backtesting
- The leakage-safety mechanism (`as_of` feature building) and its test suite
- Data-quality validators (duplicate facts, impossible values, timestamp
  ordering)
- Market Edge Engine's gated signal classifier (mechanism is real; the
  classification *thresholds* are explicitly marked as placeholders)
- Combination Engine's correlation-aware search + explicit
  "no strong combination found" result
- A real Football-Data.co.uk ingestion adapter + runnable script
  (`backend/app/services/ingestion/football_data_co_uk_adapter.py`,
  `backend/scripts/ingest_football_data_co_uk.py`) — CSV parsing is
  unit-tested against real column layouts, but has not been run against
  live data from this dev environment (see below)

**Explicitly not real yet** (and the code says so, rather than faking it):
- No live provider has actually been ingested from yet. The adapter code is
  real and tested, but this dev sandbox's network policy blocks outbound
  access to external data providers entirely (confirmed directly — see
  `docs/DEPLOYMENT.md` "Real data ingestion"). Running it for real requires
  a normal-internet host: `render.yaml` + `docs/DEPLOYMENT.md` "Getting
  real data live" give the exact steps (Supabase Postgres + Render backend
  + Vercel frontend, all free tiers)
- Until that's run, no backtest has actually run against real data, and
  Market Edge Engine / Combination Engine thresholds are unvalidated
  placeholders
- No ML model has been trained (Phase 6) — only the baselines exist
- The frontend renders honest empty states everywhere real data is missing
