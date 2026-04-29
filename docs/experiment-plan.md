# Experiment Plan

## Objective

Increase tool-selection conversion quality without harming discovery volume.

## Primary KPIs

1. Tools search submits (`tools_search`)
2. Finder searches (`finder_search`)
3. Compare page views (`compare_view`)
4. Tool detail views (`tool_detail_view`)
5. Outbound intent proxy (`cta_click`)

## Secondary KPIs

1. Favorites added
2. Signup from discovery pages
3. Paid plan upgrades

## Flagged experiments

Use feature flags from `lib/feature-flags.ts`:

1. `FF_COMPARE_PREVIEW`
- Show/hide compare preview block on `/tools`

2. `FF_FINDER_TELEMETRY`
- Enable finder search event tracking

3. `FF_TOOLS_SEARCH_TELEMETRY`
- Enable tools search event tracking

4. `FF_ADMIN_AUTO_REFRESH`
- Enable admin live auto-refresh

## Experiment protocol

1. Capture 7-day baseline before major UI changes.
2. Roll out experiment to production with one flag change at a time.
3. Observe KPI delta for minimum 7 days.
4. Abort if primary KPI drops by >10% without offsetting gain in quality metrics.
5. Keep release notes per experiment.

## Evaluation template

For each experiment:

1. Hypothesis
2. Flag state
3. Date window
4. KPI baseline
5. KPI post-change
6. Decision: keep / revert / iterate

