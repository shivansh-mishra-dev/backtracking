# Interactive Gantt Chart Implementation Guide

This document explains the technical implementation of the `GanttTimeline.tsx` component, how it integrates with the rest of the application, and why this specific visualization strategy was chosen for the Dental Scheduling system.

---

## 1. Context and Rationale

The reference project (`EmergencyCare`) uses an interactive Leaflet.js geographical map as its visual centerpiece because the core domain of ambulance dispatch is **spatial routing**.

For Dental Appointment Scheduling, the core domain is **resource allocation over time**. Therefore, the equivalent visual centerpiece is a **Gantt Chart**.

### Why the old flex-based list was insufficient:
- **Misaligned Time:** A flex container simply placed blocks side-by-side. An appointment at 09:00 in Room 1 and an appointment at 14:00 in Room 2 would both appear on the far left edge of the screen.
- **No White Space:** Gaps between appointments were completely invisible.
- **Unclear Durations:** A 20-minute filling and an 80-minute root canal looked visually identical if they were the only things in the row.

### Why SVG was chosen over HTML/CSS Flexbox:
- SVG provides absolute sub-pixel positioning based on coordinate math.
- We can map `$x = \text{start\_time}$` and `$width = \text{duration}$` with perfect mathematical precision, creating a true timeline where vertical alignment guarantees time alignment.

---

## 2. Core Architecture (`GanttTimeline.tsx`)

The component is a pure React functional component that reads from the global `AppContext` and renders a responsive `<svg>` graphic.

### Step 1: Layout Constants
We define the physical dimensions (in pixels) and logical dimensions (in hours) of the grid:

```typescript
const START_HOUR = 8; // 08:00
const END_HOUR = 18; // 18:00
const ROW_HEIGHT = 60; // Height of each room's lane
const HOUR_WIDTH = 100; // 1 hour = 100 pixels wide
```

### Step 2: The Mathematical Mapping Functions
These two functions are the heart of the Gantt chart. They translate logical time (e.g., "09:15" and "45 minutes") into physical X-coordinates and widths on the screen.

```typescript
// Converts "HH:MM" string to a pixel X-coordinate
const timeToX = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    // e.g. "09:30" -> (9 + 30/60) - 8 = 1.5 hours from start
    const hoursFromStart = (h + m / 60) - START_HOUR;
    // Add offset for the room label area on the left
    return ROOM_LABEL_WIDTH + (hoursFromStart * HOUR_WIDTH); 
};

// Converts integer minutes to pixel width
const durationToWidth = (minutes: number) => {
    return (minutes / 60) * HOUR_WIDTH;
};
```

### Step 3: Data Aggregation
The backend returns a flat list of assignments: `[{request_id: 'A1', room_id: 'R2', scheduled_time: '09:15'}, ...]`. We group these by room so we can map over rooms to draw the rows.

```typescript
const assignmentsByRoom = new Map();
rooms.forEach(r => assignmentsByRoom.set(r.id, []));

// Populate the map with enriched request objects
assignments.forEach(a => {
    const req = requests.find(r => r.id === a.request_id);
    assignmentsByRoom.get(a.room_id).push({ req, scheduled_time: a.scheduled_time });
});
```

---

## 3. SVG Rendering Layers

The SVG is rendered back-to-front (painters algorithm):

1. **Background Rows:** Alternating `#FAFAFA` (gray) and `#FFFFFF` (white) rectangles for visual separation between rooms.
2. **Time Axis Grid:** A loop draws a vertical dashed line `<line>` and a timestamp `<text>` for every hour from `START_HOUR` to `END_HOUR`.
3. **Room Labels:** A white rectangle on the left side holding the Room ID and Room Type text.
4. **Appointment Blocks:** The actual scheduled events.

### The Appointment Block (`<rect>`)
Each appointment is rendered as an SVG group `<g>` translated to its start time.

```xml
<g transform={`translate(${startX}, ${y + 8})`}>
    <!-- The colored background block -->
    <rect 
        width={width} 
        height={44} 
        rx={4}          <!-- Rounded corners -->
        fill={color}    <!-- Assigned based on dentist -->
        stroke={color} 
        strokeWidth={isMoved ? "2" : "1"}
        strokeDasharray={isMoved ? "4 2" : "none"} <!-- Dashed if rescheduled -->
    />
    
    <!-- Text Labels inside the block -->
    <text>{req.id}</text>
    
    <!-- Transparent overlay for hover interactions -->
    <rect width={width} height={44} fill="transparent">
        <title>Detailed hover tooltip text here...</title>
    </rect>
</g>
```

---

## 4. Visual Signifiers (The "Interactivity")

To make the chart informative at a glance, several design techniques from the Genesis spec were used:

1. **Dentist Color Coding:** Each dentist is assigned a distinct color from a predefined palette (`#6366F1` Indigo, `#EC4899` Pink, etc.). This allows the user to immediately spot if a dentist is double-booked (two blocks of the same color vertically aligned).
2. **Rescheduling Indicator:** If the algorithm had to move an appointment from its original requested time to resolve a conflict, the border becomes thicker and dashed (`strokeDasharray="4 2"`).
3. **Native Tooltips:** Because the blocks can be very small (e.g., a 10-minute X-Ray is only 16 pixels wide), text labels are hidden if `width < 40`. However, an invisible `<rect>` sits on top of every block with a native SVG `<title>`. Hovering over any block reveals the full details (Patient, Procedure, Time, Duration).
