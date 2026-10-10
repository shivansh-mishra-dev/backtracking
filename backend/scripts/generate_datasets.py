import os
import csv
import random
from collections import defaultdict
import re

# Set random seed for reproducibility
random.seed(42)

def to_min(t):
    h, m = t.split(':')
    return int(h) * 60 + int(m)

def to_time(m):
    return f"{m//60:02d}:{m%60:02d}"

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets', 'data')

# Procedure mapping based on original logic
PROCEDURES = {
    'General Operatory': [
        ('Checkup/Cleaning', 20, 60),
        ('Filling', 20, 60),
        ('Extraction', 20, 40)
    ],
    'Endodontic Operatory': [
        ('Root Canal', 60, 90),
        ('Crown', 45, 90)
    ],
    'Imaging Room': [
        ('X-ray/Imaging', 10, 20)
    ]
}

CASES = [
    ('case1_small_realistic', 3, 8, 45),
    ('case2_medium_synthetic', 20, 50, 300),
    ('case3_large_synthetic', 50, 125, 750),
    ('case4_huge_synthetic', 100, 250, 1500),
    ('case5_extreme_synthetic', 750, 1875, 11250)
]

def generate_case(name, num_dentists, num_rooms, num_requests):
    path = os.path.join(DATA_DIR, name)
    os.makedirs(path, exist_ok=True)
    
    # 1. Generate Rooms
    rooms = []
    for i in range(1, num_rooms + 1):
        # 60% Gen, 25% Endo, 15% Img
        r = random.random()
        if r < 0.6:
            rtype = 'General Operatory'
        elif r < 0.85:
            rtype = 'Endodontic Operatory'
        else:
            rtype = 'Imaging Room'
        rooms.append({'room_id': f'R{i}', 'room_type': rtype, 'capacity': 1})
        
    with open(os.path.join(path, 'rooms.csv'), 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=['room_id', 'room_type', 'capacity'])
        writer.writeheader()
        writer.writerows(rooms)
        
    # 2. Generate Dentists
    dentists = []
    dentist_capacities = {}
    for i in range(1, num_dentists + 1):
        if random.random() < 0.5:
            start, end = '09:00', '13:00' # 4 hours
        else:
            start, end = '09:00', '17:00' # 8 hours
            
        did = f'D{i}'
        dentists.append({
            'doctor_id': did,
            'name': f'Doctor {i}',
            'specialty': 'General Dentist',
            'working_hours_start': start,
            'working_hours_end': end
        })
        dentist_capacities[did] = {
            'start': to_min(start),
            'end': to_min(end),
            'total': to_min(end) - to_min(start),
            'used': 0
        }
        
    with open(os.path.join(path, 'doctors.csv'), 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=['doctor_id', 'name', 'specialty', 'working_hours_start', 'working_hours_end'])
        writer.writeheader()
        writer.writerows(dentists)

    # 3. Generate Requests
    requests = []
    available_room_types = list(set(r['room_type'] for r in rooms))
    
    for i in range(1, num_requests + 1):
        # Pick room type
        rtype = random.choice(available_room_types)
        proc_name, min_d, max_d = random.choice(PROCEDURES[rtype])
        duration = random.randint(min_d, max_d)
        
        # Find a dentist with capacity (cap at 80% utilization to ensure feasibility)
        valid_dentists = [did for did, cap in dentist_capacities.items() 
                          if cap['used'] + duration <= cap['total'] * 0.80]
        
        if not valid_dentists:
            print(f"WARNING: Ran out of dentist capacity in {name} at request {i}!")
            # Relax the 80% constraint to 95% if desperate
            valid_dentists = [did for did, cap in dentist_capacities.items() 
                              if cap['used'] + duration <= cap['total'] * 0.95]
            if not valid_dentists:
                print(f"CRITICAL: Absolutely no capacity left. Reducing request count.")
                break
                
        did = random.choice(valid_dentists)
        cap = dentist_capacities[did]
        
        # Pick a random requested time (can overlap, algorithm will fix it)
        # Just ensure the requested time + duration fits within their shift
        max_start = cap['end'] - duration
        req_start = random.randint(cap['start'], max_start)
        # Snap to 5 min intervals for realism
        req_start = (req_start // 5) * 5
        
        cap['used'] += duration
        
        requests.append({
            'request_id': f'A{i}',
            'patient': f'Patient {i}',
            'doctor_id': did,
            'procedure_type': proc_name,
            'acceptable_room_type': rtype,
            'requested_start': to_time(req_start),
            'duration_min': duration
        })

    with open(os.path.join(path, 'requests.csv'), 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=['request_id', 'patient', 'doctor_id', 'procedure_type', 'acceptable_room_type', 'requested_start', 'duration_min'])
        writer.writeheader()
        writer.writerows(requests)

    print(f"Generated {name}: {len(rooms)} rooms, {len(dentists)} dentists, {len(requests)} requests.")
    
for case in CASES:
    generate_case(*case)
