import re
import time
import copy
from typing import List, Dict, Any, Tuple, Optional
from collections import defaultdict

SLOT_INTERVAL = 15  # Generate candidate slots every 15 minutes


def convert_time_to_minutes(time_str: str) -> int:
    """Helper to convert HH:MM to integer minutes since midnight."""
    h, m = time_str.split(":")
    return int(h) * 60 + int(m)


def minutes_to_time(minutes: int) -> str:
    """Helper to convert minutes since midnight back to HH:MM."""
    return f"{minutes // 60:02d}:{minutes % 60:02d}"


class DentalSchedulerCSP:
    """
    CSP for dental appointment scheduling.

    Variables:  Each appointment request.
    Domain:     (room_id, start_time_minutes) pairs for each request.
    Constraints:
        1. Room-type match (pre-filtered into domain).
        2. Dentist working hours (pre-filtered into domain).
        3. No room double-booking: two appointments in the same room must not overlap.
        4. No dentist double-booking: a dentist cannot have two overlapping appointments.
    """

    def __init__(self, requests, rooms, dentists, progress_state=None):
        self.requests = sorted(
            requests, key=lambda r: re.sub(r"\d+", lambda m: m.group().zfill(5), r.id)
        )
        self.req_map = {r.id: r for r in self.requests}  # O(1) lookup
        self.rooms = rooms
        self.dentists = {d.id: d for d in dentists}
        self.progress_state = progress_state

        # assignments: req_id -> (room_id, start_minutes)
        self.assignments: Dict[str, Tuple[str, int]] = {}
        self.best_assignments: Dict[str, Tuple[str, int]] = {}
        self.logs: List[Dict] = []
        self.states_explored = 0
        self.backtracks = 0
        self.max_depth = 0
        self.deepest_req_id = None

        # Indexed schedules for O(1)-ish constraint checking
        # room_schedule[room_id] = [(start, end, req_id), ...]
        self.room_schedule: Dict[str, List[Tuple[int, int, str]]] = defaultdict(list)
        # dentist_schedule[dentist_id] = [(start, end, req_id), ...]
        self.dentist_schedule: Dict[str, List[Tuple[int, int, str]]] = defaultdict(list)

        # Pre-compute domains for each request
        self.base_domains = self._compute_domains()

    def _compute_domains(self) -> Dict[str, List[Tuple[str, int]]]:
        """
        For each request, generate all (room_id, start_time) pairs that satisfy
        the unary constraints (room type match, dentist working hours).
        The requested_time is placed FIRST in the domain so it's tried first.
        """
        domains = {}
        for req in self.requests:
            dentist = self.dentists.get(req.dentist_id)
            if not dentist:
                domains[req.id] = []
                continue

            d_start = convert_time_to_minutes(dentist.start_time)
            d_end = convert_time_to_minutes(dentist.end_time)
            preferred_start = convert_time_to_minutes(req.requested_time)

            # Find compatible rooms
            compatible_rooms = [
                r for r in self.rooms if r.room_type == req.acceptable_room_type
            ]

            # Generate time slots within dentist hours
            possible_starts = set()

            # Always include the exact requested time if valid
            if (
                preferred_start >= d_start
                and preferred_start + req.duration_min <= d_end
            ):
                possible_starts.add(preferred_start)

            # Generate slot-aligned times
            t = d_start
            while t + req.duration_min <= d_end:
                possible_starts.add(t)
                t += SLOT_INTERVAL

            # Sort slots by distance from preferred time (try preferred first)
            sorted_starts = sorted(
                possible_starts, key=lambda s: abs(s - preferred_start)
            )

            domain = []
            for start in sorted_starts:
                for room in compatible_rooms:
                    domain.append((room.id, start))

            domains[req.id] = domain
        return domains

    def _has_overlap(
        self, schedule: List[Tuple[int, int, str]], start: int, end: int
    ) -> bool:
        """Check if a time range overlaps with any interval in a schedule."""
        for s, e, _ in schedule:
            if not (end <= s or start >= e):
                return True
        return False

    def _add_to_schedules(
        self, req_id: str, room_id: str, start: int, end: int, dentist_id: str
    ):
        """Add an assignment to the indexed schedules."""
        self.room_schedule[room_id].append((start, end, req_id))
        self.dentist_schedule[dentist_id].append((start, end, req_id))

    def _remove_from_schedules(self, req_id: str, room_id: str, dentist_id: str):
        """Remove an assignment from the indexed schedules."""
        self.room_schedule[room_id] = [
            (s, e, rid) for s, e, rid in self.room_schedule[room_id] if rid != req_id
        ]
        self.dentist_schedule[dentist_id] = [
            (s, e, rid)
            for s, e, rid in self.dentist_schedule[dentist_id]
            if rid != req_id
        ]

    def _update_progress(self):
        if self.progress_state and self.states_explored % 500 == 0:
            self.progress_state["states_explored"] = self.states_explored
            self.progress_state["backtracks"] = self.backtracks

    def log(self, message: str, state_type: str = "INFO"):
        # Only keep first 5000 log entries to prevent memory explosion
        if len(self.logs) < 5000:
            self.logs.append(
                {
                    "iteration": self.states_explored,
                    "type": state_type,
                    "message": message,
                }
            )

    def record_best(self):
        current_depth = len(self.assignments)
        if current_depth > self.max_depth:
            self.max_depth = current_depth
            self.best_assignments = dict(self.assignments)

    def is_valid_fast(self, req, room_id: str, start: int) -> Tuple[bool, str]:
        """Check binary constraints using indexed schedules — much faster than linear scan."""
        end = start + req.duration_min

        # Check room overlap
        if self._has_overlap(self.room_schedule[room_id], start, end):
            return False, "Room Overlap"

        # Check dentist overlap
        if self._has_overlap(self.dentist_schedule[req.dentist_id], start, end):
            return False, "Dentist Double-Booked"

        return True, "Valid"

    # ─────────────────────────────────────────────────────
    # Algorithm 1: Standard Backtracking
    # ─────────────────────────────────────────────────────
    def standard_backtracking(self) -> bool:
        """Solves the scheduling CSP using Standard Backtracking."""
        unassigned = [r for r in self.requests if r.id not in self.assignments]

        if not unassigned:
            self.log("All requests assigned successfully.", "COMPLETE")
            return True

        req = unassigned[0]

        if len(self.assignments) >= self.max_depth:
            self.deepest_req_id = req.id

        self.states_explored += 1
        self._update_progress()
        self.log(
            f"Attempting to place {req.id} ({req.procedure}, Dentist {req.dentist_id})...",
            "STATE",
        )

        if self.states_explored > 5000000:
            self.log(
                "Exploration cap reached (5,000,000 states). Standard Backtracking is thrashing. Aborting.",
                "ERROR",
            )
            return False

        for room_id, start in self.base_domains.get(req.id, []):
            is_valid, reason = self.is_valid_fast(req, room_id, start)

            if is_valid:
                end = start + req.duration_min
                self.log(
                    f"Assign {req.id} -> {room_id} @ {minutes_to_time(start)}",
                    "SUCCESS",
                )
                self.assignments[req.id] = (room_id, start)
                self._add_to_schedules(req.id, room_id, start, end, req.dentist_id)
                self.record_best()

                if self.standard_backtracking():
                    return True

                self.backtracks += 1
                self.log(
                    f"Backtrack: unassign {req.id} from {room_id} @ {minutes_to_time(start)}",
                    "BACKTRACK",
                )
                del self.assignments[req.id]
                self._remove_from_schedules(req.id, room_id, req.dentist_id)

        self.log(f"No valid assignments for {req.id}.", "ERROR")
        return False

    # ─────────────────────────────────────────────────────
    # Algorithm 2: Brute-Force (Generate & Test)
    # ─────────────────────────────────────────────────────
    def brute_force(self) -> bool:
        """
        Brute-force: assign values without checking constraints until we reach
        a complete assignment, then validate the whole board.
        Capped at 500,000 states to prevent server hang.
        """
        unassigned = [r for r in self.requests if r.id not in self.assignments]

        if not unassigned:
            # Validate the entire board at once
            for req in self.requests:
                room_id, start = self.assignments[req.id]
                end = start + req.duration_min
                # Temporarily remove from schedules to check against others
                self._remove_from_schedules(req.id, room_id, req.dentist_id)
                is_valid, _ = self.is_valid_fast(req, room_id, start)
                self._add_to_schedules(req.id, room_id, start, end, req.dentist_id)
                if not is_valid:
                    return False
            self.log("All requests assigned successfully.", "COMPLETE")
            return True

        req = unassigned[0]

        if len(self.assignments) >= self.max_depth:
            self.deepest_req_id = req.id

        self.states_explored += 1
        self._update_progress()
        self.log(f"Attempting to place {req.id}...", "STATE")

        if self.states_explored > 500000:
            self.log("Exploration cap reached (500,000 states). Aborting.", "ERROR")
            return False

        for room_id, start in self.base_domains.get(req.id, []):
            end = start + req.duration_min
            self.assignments[req.id] = (room_id, start)
            self._add_to_schedules(req.id, room_id, start, end, req.dentist_id)
            self.record_best()

            if self.brute_force():
                return True

            self.backtracks += 1
            del self.assignments[req.id]
            self._remove_from_schedules(req.id, room_id, req.dentist_id)

        return False

    # ─────────────────────────────────────────────────────
    # Algorithm 3: Backtracking + Forward Checking (MRV)
    # ─────────────────────────────────────────────────────
    def forward_checking(
        self, domains: Optional[Dict[str, List[Tuple[str, int]]]] = None
    ) -> bool:
        """
        Backtracking with Forward Checking and MRV (Minimum Remaining Values) heuristic.
        After each assignment, prune the domains of future variables.
        If any domain becomes empty, backtrack immediately.
        """
        if domains is None:
            domains = copy.deepcopy(self.base_domains)

        unassigned = [r for r in self.requests if r.id not in self.assignments]
        if not unassigned:
            self.log("All requests assigned successfully.", "COMPLETE")
            return True

        # MRV: pick the request with the fewest remaining options
        unassigned.sort(key=lambda req: len(domains.get(req.id, [])))
        req = unassigned[0]

        if len(self.assignments) >= self.max_depth:
            self.deepest_req_id = req.id

        self.states_explored += 1
        self._update_progress()
        self.log(
            f"Attempting {req.id} (domain size: {len(domains.get(req.id, []))})",
            "STATE",
        )

        if self.states_explored > 5000000:
            self.log("Exploration cap reached (5,000,000 states). Aborting.", "ERROR")
            return False

        for room_id, start in domains.get(req.id, []):
            is_valid, reason = self.is_valid_fast(req, room_id, start)

            if is_valid:
                end = start + req.duration_min
                self.log(
                    f"Assign {req.id} -> {room_id} @ {minutes_to_time(start)}",
                    "SUCCESS",
                )
                self.assignments[req.id] = (room_id, start)
                self._add_to_schedules(req.id, room_id, start, end, req.dentist_id)
                self.record_best()

                # Forward check: prune domains of remaining unassigned requests
                new_domains = {}
                domain_wipeout = False

                for other_req in unassigned:
                    if other_req.id == req.id:
                        continue

                    pruned = []
                    for o_room, o_start in domains[other_req.id]:
                        o_end = o_start + other_req.duration_min
                        # Check if this option conflicts with the new assignment
                        overlaps = not (end <= o_start or start >= o_end)
                        if overlaps:
                            if o_room == room_id:
                                continue  # Same room, same time -> prune
                            if other_req.dentist_id == req.dentist_id:
                                continue  # Same dentist, same time -> prune
                        pruned.append((o_room, o_start))

                    if len(pruned) == 0:
                        domain_wipeout = True
                        self.log(
                            f"Domain wipeout: {other_req.id} has no options left.",
                            "ERROR",
                        )
                        break
                    new_domains[other_req.id] = pruned

                if not domain_wipeout:
                    if self.forward_checking(new_domains):
                        return True

                self.backtracks += 1
                self.log(f"Backtrack: unassign {req.id}", "BACKTRACK")
                del self.assignments[req.id]
                self._remove_from_schedules(req.id, room_id, req.dentist_id)

        self.log(f"No valid assignments for {req.id}.", "ERROR")
        return False


def run_scheduler(
    requests, rooms, dentists, algorithm="Backtracking", progress_state=None
) -> Dict[str, Any]:
    start_time = time.time()
    csp = DentalSchedulerCSP(requests, rooms, dentists, progress_state)

    if algorithm == "Brute-Force Search":
        success = csp.brute_force()
    elif algorithm == "Backtracking + Forward Checking":
        success = csp.forward_checking()
    else:
        success = csp.standard_backtracking()

    runtime_ms = (time.time() - start_time) * 1000

    error_reason = None
    if not success:
        error_reason = f"Algorithm could not find a valid schedule. Got stuck trying to place Request {csp.deepest_req_id}."

    # Build output assignments including the resolved start time
    def format_assignments(assignment_dict):
        result = []
        for req_id, (room_id, start_min) in assignment_dict.items():
            result.append(
                {
                    "request_id": req_id,
                    "room_id": room_id,
                    "scheduled_time": minutes_to_time(start_min),
                }
            )
        return result

    return {
        "status": "success" if success else "failed",
        "error_reason": error_reason,
        "deepest_req_id": csp.deepest_req_id,
        "algorithm": algorithm,
        "runtime_ms": runtime_ms,
        "states_explored": csp.states_explored,
        "backtracks": csp.backtracks,
        "assignments": format_assignments(csp.assignments),
        "partial_assignments": format_assignments(csp.best_assignments),
        "logs": csp.logs,
    }
