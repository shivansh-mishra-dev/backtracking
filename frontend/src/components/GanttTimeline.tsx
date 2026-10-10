import React from 'react';
import { useAppContext } from '../context/AppContext';

const GanttTimeline: React.FC = () => {
    const { scheduleResult, rooms, requests, dentists } = useAppContext();
    
    // Layout constants
    const START_HOUR = 8; // 08:00
    const END_HOUR = 18; // 18:00
    const TOTAL_HOURS = END_HOUR - START_HOUR;
    
    const ROW_HEIGHT = 60;
    const TIME_AXIS_HEIGHT = 40;
    const ROOM_LABEL_WIDTH = 120;
    const HOUR_WIDTH = 100; // pixels per hour
    
    const totalWidth = ROOM_LABEL_WIDTH + (TOTAL_HOURS * HOUR_WIDTH);
    const totalHeight = TIME_AXIS_HEIGHT + (rooms.length * ROW_HEIGHT);

    // Helpers
    const timeToX = (timeStr: string) => {
        const [h, m] = timeStr.split(':').map(Number);
        const hoursFromStart = (h + m / 60) - START_HOUR;
        return ROOM_LABEL_WIDTH + (hoursFromStart * HOUR_WIDTH);
    };

    const durationToWidth = (minutes: number) => {
        return (minutes / 60) * HOUR_WIDTH;
    };

    // Color palette for dentists
    const colors = ['#6366F1', '#EC4899', '#14B8A6', '#F59E0B', '#8B5CF6', '#10B981', '#3B82F6', '#EF4444'];
    const getDentistColor = (did: string) => {
        const idx = dentists.findIndex(d => d.id === did);
        return colors[idx % colors.length];
    };

    // Prepare assignments mapping
    const assignmentsByRoom = new Map();
    rooms.forEach(r => assignmentsByRoom.set(r.id, []));
    
    if (scheduleResult) {
        const assignments = scheduleResult.status === 'success' 
            ? scheduleResult.assignments 
            : scheduleResult.partial_assignments || [];
            
        assignments.forEach(a => {
            const req = requests.find(r => r.id === a.request_id);
            if (req) {
                const arr = assignmentsByRoom.get(a.room_id) || [];
                arr.push({ req, scheduled_time: a.scheduled_time });
                assignmentsByRoom.set(a.room_id, arr);
            }
        });
    }

    // Grid lines for hours
    const hourGridLines = [];
    for (let h = START_HOUR; h <= END_HOUR; h++) {
        const x = ROOM_LABEL_WIDTH + ((h - START_HOUR) * HOUR_WIDTH);
        hourGridLines.push(
            <g key={`hour-${h}`}>
                <line 
                    x1={x} y1={TIME_AXIS_HEIGHT} 
                    x2={x} y2={totalHeight} 
                    stroke="#E8E8EC" 
                    strokeWidth="1" 
                    strokeDasharray={h === START_HOUR || h === END_HOUR ? "none" : "4 4"}
                />
                <text 
                    x={x} y={24} 
                    fontSize="12" 
                    fill="#6B6B6B" 
                    textAnchor="middle"
                    fontFamily="JetBrains Mono, monospace"
                >
                    {`${h.toString().padStart(2, '0')}:00`}
                </text>
            </g>
        );
    }

    return (
        <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '12px', background: 'white' }}>
            <svg width={totalWidth} height={totalHeight} style={{ display: 'block' }}>
                {/* Background Alternating Row Colors */}
                {rooms.map((_, i) => (
                    <rect 
                        key={`bg-${i}`}
                        x={0} 
                        y={TIME_AXIS_HEIGHT + (i * ROW_HEIGHT)} 
                        width={totalWidth} 
                        height={ROW_HEIGHT} 
                        fill={i % 2 === 0 ? "#FAFAFA" : "#FFFFFF"} 
                    />
                ))}

                {/* Time Axis Grid */}
                {hourGridLines}
                
                {/* Horizontal line under time axis */}
                <line x1={0} y1={TIME_AXIS_HEIGHT} x2={totalWidth} y2={TIME_AXIS_HEIGHT} stroke="#E8E8EC" strokeWidth="1" />

                {/* Room Labels and Assignments */}
                {rooms.map((room, i) => {
                    const y = TIME_AXIS_HEIGHT + (i * ROW_HEIGHT);
                    const centerY = y + (ROW_HEIGHT / 2);
                    const assignments = assignmentsByRoom.get(room.id) || [];

                    return (
                        <g key={`room-${room.id}`}>
                            {/* Room Label */}
                            <rect x={0} y={y} width={ROOM_LABEL_WIDTH} height={ROW_HEIGHT} fill="#FFFFFF" opacity={0.9} />
                            <text x={16} y={centerY - 6} fontSize="14" fontWeight="600" fill="#0A0A0A" fontFamily="General Sans, sans-serif">{room.id}</text>
                            <text x={16} y={centerY + 12} fontSize="11" fill="#6B6B6B" fontFamily="DM Sans, sans-serif">{room.room_type.replace(' Operatory', '')}</text>
                            <line x1={ROOM_LABEL_WIDTH} y1={y} x2={ROOM_LABEL_WIDTH} y2={y + ROW_HEIGHT} stroke="#E8E8EC" strokeWidth="1" />
                            <line x1={0} y1={y + ROW_HEIGHT} x2={totalWidth} y2={y + ROW_HEIGHT} stroke="#E8E8EC" strokeWidth="1" />

                            {/* Appointment Blocks */}
                            {assignments.map((item: any) => {
                                const { req, scheduled_time } = item;
                                const startX = timeToX(scheduled_time);
                                const width = durationToWidth(req.duration_min);
                                const isMoved = req.requested_time !== scheduled_time;
                                const color = getDentistColor(req.dentist_id);

                                return (
                                    <g key={req.id} transform={`translate(${startX}, ${y + 8})`}>
                                        <rect 
                                            x={0} y={0} 
                                            width={Math.max(width - 2, 4)} 
                                            height={ROW_HEIGHT - 16} 
                                            rx={4}
                                            fill={color}
                                            fillOpacity={0.15}
                                            stroke={color}
                                            strokeWidth={isMoved ? "2" : "1"}
                                            strokeDasharray={isMoved ? "4 2" : "none"}
                                        />
                                        
                                        {width > 40 && (
                                            <>
                                                <text x={6} y={16} fontSize="11" fontWeight="600" fill={color} fontFamily="DM Sans, sans-serif" style={{ pointerEvents: 'none' }}>
                                                    {req.id}
                                                </text>
                                                <text x={6} y={30} fontSize="10" fill={color} fontFamily="DM Sans, sans-serif" style={{ pointerEvents: 'none', opacity: 0.8 }}>
                                                    {req.dentist_id}
                                                </text>
                                            </>
                                        )}

                                        {/* Hover Tooltip Overlay (using title for native tooltip) */}
                                        <rect x={0} y={0} width={Math.max(width - 2, 4)} height={ROW_HEIGHT - 16} fill="transparent" style={{ cursor: 'pointer' }}>
                                            <title>
                                                {`Request: ${req.id} (${req.procedure})
Patient: ${req.patient}
Dentist: ${req.dentist_id}
Requested: ${req.requested_time}
Scheduled: ${scheduled_time} ${isMoved ? '(MOVED)' : ''}
Duration: ${req.duration_min} min`}
                                            </title>
                                        </rect>
                                    </g>
                                );
                            })}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

export default GanttTimeline;
