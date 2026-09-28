import React from 'react';

const DataView: React.FC = () => {
    return (
        <div className="content flex flex-col gap-24" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div className="mb-8">
                <h1 className="section-heading">Dataset Explorer</h1>
                <p className="body-text mt-4" style={{ color: 'var(--text-secondary)' }}>View the constraints and requests loaded for the current benchmark case.</p>
            </div>

            <div className="card">
                <div className="card-header"><h3 className="subhead" style={{ fontSize: '18px' }}>doctors.csv</h3></div>
                <div className="card-body p-0" style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead><tr><th>Dentist ID</th><th>Name</th><th>Start Time</th><th>End Time</th></tr></thead>
                        <tbody>
                            <tr><td>D1</td><td>Dr. Smith</td><td>09:00</td><td>17:00</td></tr>
                            <tr><td>D2</td><td>Dr. Jones</td><td>09:00</td><td>17:00</td></tr>
                            <tr><td>D3</td><td>Dr. Doe</td><td>08:30</td><td>15:00</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card">
                <div className="card-header"><h3 className="subhead" style={{ fontSize: '18px' }}>rooms.csv</h3></div>
                <div className="card-body p-0" style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead><tr><th>Operatory ID</th><th>Type</th></tr></thead>
                        <tbody>
                            <tr><td>O1</td><td>General</td></tr>
                            <tr><td>O2</td><td>Endodontic</td></tr>
                            <tr><td>O3</td><td>Imaging</td></tr>
                            <tr><td>O4</td><td>General</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card">
                <div className="card-header"><h3 className="subhead" style={{ fontSize: '18px' }}>requests.csv</h3></div>
                <div className="card-body p-0" style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead><tr><th>Req ID</th><th>Patient</th><th>Dentist</th><th>Procedure</th><th>Requested Time</th><th>Duration (min)</th></tr></thead>
                        <tbody>
                            <tr><td>R1</td><td>Alice P.</td><td>Dr. Smith</td><td>Cleaning</td><td>09:00</td><td>45</td></tr>
                            <tr><td>R2</td><td>Bob M.</td><td>Dr. Doe</td><td>Root Canal</td><td>09:30</td><td>120</td></tr>
                            <tr><td>R3</td><td>Charlie T.</td><td>Dr. Jones</td><td>Filling</td><td>10:00</td><td>60</td></tr>
                            <tr><td>R4</td><td>David L.</td><td>Dr. Smith</td><td>X-Ray</td><td>11:00</td><td>15</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DataView;
