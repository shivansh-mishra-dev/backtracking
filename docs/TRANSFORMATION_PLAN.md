Implementation Plan: Fix & Transform DentalSched
Problem Summary

Two critical issues need solving:

Issue 1: The Engine is Broken

Every dataset except Case 0 is mathematically infeasible. The CSV generator created random appointments without checking whether a dentist has enough working hours:

Dataset	Doctor	Needs	Has	Overload
Case 1 (Small)	D1	517 min	240 min	215%
Case 1 (Small)	D3	798 min	480 min	166%
Case 2 (Medium)	D11	866 min	240 min	360%
Case 3 (Large)	D23	982 min	240 min	409%

No algorithm can schedule 517 minutes of work into a 240-minute window. The algorithms aren't slow — they're exhaustively proving that no solution exists. Additionally, forward_checking has no state cap, so it runs forever on infeasible data.

Issue 2: The UI is Not Presentation-Ready

Compared to the reference project (EmergencyCare — ambulance dispatch with interactive Leaflet map, live telemetry, route polylines), your project lacks:

A compelling visual centerpiece (their map with driving routes = your missing Gantt timeline)
Immediate visual feedback on user actions
A working step-by-step algorithm visualizer (yours has a parsing bug)
Pre-seeded benchmark data in the performance chart
User Review Required

IMPORTANT

Dataset Regeneration Strategy: I will write a Python script that generates guaranteed-solvable datasets by:

Capping each dentist's total appointment load at 75-85% of their working hours
Distributing procedures realistically across room types
Creating intentional time conflicts (overlapping requested times) so the algorithm has real work to do

This means Cases 1–5 will have new data. The old data was fundamentally broken — no valid schedule was ever possible.

WARNING

Scope Decision: The reference project uses a Leaflet.js interactive map as its visual centerpiece. For dental scheduling, the equivalent visual centerpiece is an interactive Gantt-style timeline chart showing rooms on the Y-axis and time on the X-axis, with colored blocks for each appointment. Should I:

(A) Build a full Gantt timeline using Canvas/SVG (high impact, ~2-3 hours of work)
(B) Polish the existing flex-based room list (lower impact, ~30 min)

I recommend (A) — it's the single highest-impact visual improvement.

Proposed Changes
Component 1: Dataset Generator Script

Goal: Generate guaranteed-solvable datasets for all 5 cases.

[NEW] backend/scripts/generate_datasets.py

A Python script that:

Takes parameters: num_dentists, num_rooms, num_requests
Creates dentists with realistic working hours (mix of 4h and 8h shifts)
Creates rooms with correct type distribution (~60% General, ~25% Endodontic, ~15% Imaging)
Generates requests by:
Picking a random dentist
Checking remaining capacity for that dentist
Picking a random time within their hours (with intentional overlaps to create conflicts)
Picking a procedure that matches an available room type
Never exceeding 80% of any dentist's available minutes
Outputs CSV files to the correct backend/assets/data/ directories
python
# Core capacity-checking logic
def generate_requests(dentists, rooms, num_requests):
    dentist_used = {d.id: 0 for d in dentists}
    requests = []
    for i in range(num_requests):
        # Pick a dentist with remaining capacity
        available = [d for d in dentists 
                     if dentist_used[d.id] + avg_duration <= d.capacity * 0.80]
        dentist = random.choice(available)
        # ... generate request within dentist's hours
        dentist_used[dentist.id] += duration
    return requests
[MODIFY] All dataset CSV files in backend/assets/data/case1-5/

Regenerated with guaranteed feasibility.

Component 2: Algorithm Fixes
[MODIFY] backend/services/scheduler.py

Fix 1: Add state cap to forward_checking

python
def forward_checking(self, domains=None) -> bool:
    # ... existing code ...
    self.states_explored += 1
    self._update_progress()
    
    # NEW: Safety cap (same pattern as other algorithms)
    if self.states_explored > 5000000:
        self.log("Exploration cap reached.", "ERROR")
        return False

Fix 2: Natural sort order for request IDs Currently A10 sorts before A2. Fix with:

python
import re
self.requests = sorted(requests, key=lambda r: (
    re.sub(r'\d+', lambda m: m.group().zfill(5), r.id)
))

Fix 3: Fix log message for Visualizer compatibility The Visualizer expects "No valid assignments" but the engine emits "Exhausted all options":

python
# Change this:
self.log(f"Exhausted all options for {req.id}.", "ERROR")
# To this:
self.log(f"No valid assignments for {req.id}.", "ERROR")
Component 3: Interactive Gantt Timeline (Visual Centerpiece)
[NEW] frontend/src/components/GanttTimeline.tsx

A Canvas/SVG-based interactive Gantt chart that replaces the current flex-based room list in DashboardView.tsx.

Design:

         09:00  10:00  11:00  12:00  13:00  14:00  15:00  16:00  17:00
  R1  |  [■ A1 - Dr.Smith (Filling) ■]     [■ A5 - Dr.Jones ■]
  R2  |       [■ A2 - Dr.Smith (Cleaning) ■]          [■ A8 ■]
  R3  |  [■■■ A3 - Dr.Patel (Root Canal) ■■■■■■]
  R4  |                    [■ A4 ■]  [■ A6 ■]
  ...

Features:

Rooms on Y-axis, time (09:00–17:00) on X-axis with gridlines
Colored blocks proportional to actual duration
Color-coded by dentist (each dentist gets a unique color)
Hover tooltip showing: Patient, Dentist, Procedure, Requested vs Scheduled time
Appointments that were rescheduled (scheduled ≠ requested) get a subtle border/pattern indicator
Responsive sizing

Implementation approach: Pure React with inline SVG (no extra dependency needed). Each appointment is a <rect> with calculated x/width based on time, y based on room index.

tsx
const GanttTimeline: React.FC = () => {
    const { scheduleResult, rooms, requests, dentists } = useAppContext();
    
    const HOUR_WIDTH = 80; // px per hour
    const ROW_HEIGHT = 48;
    const START_HOUR = 9;
    const END_HOUR = 17;
    
    // ... map assignments to SVG rects
    return (
        <svg width={totalWidth} height={totalHeight}>
            {/* Time gridlines */}
            {/* Room labels */}
            {/* Appointment blocks */}
        </svg>
    );
};
[MODIFY] frontend/src/components/DashboardView.tsx

Replace the current flex-based room list with <GanttTimeline />.

Component 4: Visualizer Fixes & Autoplay
[MODIFY] frontend/src/components/VisualizerView.tsx

Fix 1: Tree parsing bug

typescript
// Change this (broken — string never matches):
if (log.message.startsWith('No valid assignments')) {
// The backend now emits this exact string (after Fix 3 above),
// so this will work correctly.

Fix 2: Remove unused Play import (causes TypeScript build failure)

typescript
// Remove:
import { Play, ... } from 'lucide-react';

Fix 3: Add Autoplay with speed control

tsx
const [autoPlay, setAutoPlay] = useState(false);
const [speed, setSpeed] = useState(200); // ms per step
useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
        setStep(prev => {
            if (prev >= logs.length - 1) { setAutoPlay(false); return prev; }
            return prev + 1;
        });
    }, speed);
    return () => clearInterval(timer);
}, [autoPlay, speed, logs.length]);
// Render: Play/Pause button + Speed slider (50ms to 1000ms)
Component 5: Performance Chart Pre-Seeding
[MODIFY] frontend/src/components/PerformanceChart.tsx

Currently the chart is completely empty until the user manually runs every algorithm on every dataset. For a presentation, we should pre-seed the chart with baseline benchmark data from actual runs.

After regenerating datasets and fixing algorithms, I'll run all combinations and hardcode the results:

typescript
const BASELINE_DATA = {
    'Brute-Force Search': [0.05, null, null, null, null, null], // Only Tiny succeeds
    'Standard Backtracking': [0.03, 850, null, null, null, null],
    'Backtracking + Forward Checking': [0.02, 12, 340, 2100, null, null]
};

The chart will show baselines by default, and overlay user-run results on top.

Component 6: General UI Polish
[MODIFY] frontend/src/index.css
Add .table and .table-container classes (currently missing, referenced by OutputView)
Add Gantt-specific styles
[DELETE] frontend/src/App.css

Dead Vite boilerplate code — not imported anywhere.

[MODIFY] frontend/src/components/Sidebar.tsx
Move FileStatus component outside Sidebar to avoid React reconciliation warnings
Replace alert() calls with styled inline error/success banners
Implementation Order

Estimated time: ~2-3 hours total

Verification Plan
Automated Tests
bash
# After dataset regeneration — verify all cases are feasible
cd backend && python3 -c "
from scripts.generate_datasets import verify_feasibility
for case in ['case1', 'case2', 'case3', 'case4', 'case5']:
    assert verify_feasibility(case), f'{case} is infeasible!'
print('All cases verified feasible.')
"
# After algorithm fixes — verify FC solves Case 1 in < 5 seconds
cd backend && timeout 10 python3 -c "
from services.scheduler import *
import models, database
# ... load Case 1 and run FC
assert result['status'] == 'success'
print(f'Case 1 solved in {result[\"runtime_ms\"]:.0f}ms')
"
# TypeScript build check
cd frontend && npx tsc --noEmit
Manual Verification
Load each dataset (Case 0–5) and run "Backtracking + Forward Checking" — all should show "Complete Assignment" status
Run Standard Backtracking on Case 1 — should complete in seconds (not minutes)
Gantt timeline — visually verify appointments don't overlap within the same room, and time axis is proportional
Visualizer — click Play and watch the tree build step-by-step with correct indentation
Performance Chart — should show pre-seeded baselines with clear FC advantage visible
Output tab — verify "Requested" vs "Scheduled" columns show time adjustments