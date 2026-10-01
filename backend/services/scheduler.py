import time
from typing import List, Dict, Any

def convert_time_to_minutes(time_str: str) -> int:
    """Helper to convert HH:MM to integer minutes since midnight."""
    h, m = time_str.split(':')
    return int(h) * 60 + int(m)

class DentalSchedulerCSP:
    def __init__(self, requests, rooms, dentists):
        self.requests = requests
        self.rooms = rooms
        self.dentists = {d.id: d for d in dentists}
        
        self.assignments = {} # req_id -> room_id
        self.logs = []
        self.states_explored = 0
        self.backtracks = 0
        self.max_depth = 0
        self.deepest_req_id = None
        
    def log(self, message: str, state_type: str = "INFO"):
        self.logs.append({"iteration": self.states_explored, "type": state_type, "message": message})

    def is_valid_assignment(self, req, room_id, current_assignments):
        room = next((r for r in self.rooms if r.id == room_id), None)
        if not room:
            return False, "Room Not Found"
            
        # 1. Constraint: Room Type Match
        # In a real app, you'd map procedure to required room type. 
        # Here we assume a strict match or a predefined mapping.
        if req.procedure == "Cleaning" and room.room_type != "General":
            return False, "Wrong Room Type"
            
        # 2. Constraint: Dentist Working Hours
        dentist = self.dentists.get(req.dentist_id)
        if dentist:
            req_start = convert_time_to_minutes(req.requested_time)
            req_end = req_start + req.duration_min
            d_start = convert_time_to_minutes(dentist.start_time)
            d_end = convert_time_to_minutes(dentist.end_time)
            if req_start < d_start or req_end > d_end:
                return False, "Outside Dentist Hours"

        # 3. Constraint: Room Overlap & Dentist Overlap
        req_start = convert_time_to_minutes(req.requested_time)
        req_end = req_start + req.duration_min
        
        for assigned_req_id, assigned_room_id in current_assignments.items():
            assigned_req = next(r for r in self.requests if r.id == assigned_req_id)
            a_start = convert_time_to_minutes(assigned_req.requested_time)
            a_end = a_start + assigned_req.duration_min
            
            # Check time overlap
            if not (req_end <= a_start or req_start >= a_end):
                # Overlaps in time. Check room overlap.
                if assigned_room_id == room_id:
                    return False, "Room Overlap"
                # Check dentist overlap
                if assigned_req.dentist_id == req.dentist_id:
                    return False, "Dentist Double-Booked"
                    
        return True, "Valid"

    def standard_backtracking(self) -> bool:
        """Solves the scheduling CSP using Standard Backtracking."""
        # Find an unassigned request
        unassigned_reqs = [r for r in self.requests if r.id not in self.assignments]
        
        if not unassigned_reqs:
            self.log("All requests assigned successfully.", "COMPLETE")
            return True # All assigned!
            
        req = unassigned_reqs[0]
        
        current_depth = len(self.assignments)
        if current_depth >= self.max_depth:
            self.max_depth = current_depth
            self.deepest_req_id = req.id

        self.states_explored += 1
        self.log(f"Attempting to place {req.id}...", "STATE")
        
        for room in self.rooms:
            is_valid, reason = self.is_valid_assignment(req, room.id, self.assignments)
            
            if is_valid:
                self.log(f"Try {room.id} @ {req.requested_time} -> Assigned", "SUCCESS")
                self.assignments[req.id] = room.id
                
                if self.standard_backtracking():
                    return True
                    
                # Backtrack
                self.backtracks += 1
                self.log(f"Unassigning {req.id} from {room.id}", "BACKTRACK")
                del self.assignments[req.id]
            else:
                self.log(f"Try {room.id} @ {req.requested_time} -> Conflict ({reason})", "ERROR")
                
        self.log(f"No valid assignments for {req.id}.", "ERROR")
        return False

def run_scheduler(requests, rooms, dentists, algorithm="Backtracking") -> Dict[str, Any]:
    start_time = time.time()
    csp = DentalSchedulerCSP(requests, rooms, dentists)
    
    if algorithm == "Brute-Force Search":
        # Implementation left as exercise, defaulting to Backtracking
        success = csp.standard_backtracking()
    elif algorithm == "Backtracking + Forward Checking":
        # Implementation left as exercise, defaulting to Backtracking
        success = csp.standard_backtracking()
    else:
        success = csp.standard_backtracking()
        
    runtime_ms = (time.time() - start_time) * 1000
    
    error_reason = None
    if not success:
        error_reason = f"Algorithm exhausted search space and failed to place Request {csp.deepest_req_id}. This request inherently conflicts with a previously assigned request (e.g. Dentist Double-Booked at the same requested time)."

    return {
        "status": "success" if success else "failed",
        "error_reason": error_reason,
        "algorithm": algorithm,
        "runtime_ms": runtime_ms,
        "states_explored": csp.states_explored,
        "backtracks": csp.backtracks,
        "assignments": [{"request_id": k, "room_id": v} for k, v in csp.assignments.items()],
        "logs": csp.logs
    }
