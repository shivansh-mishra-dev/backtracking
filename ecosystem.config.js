module.exports = {
    apps: [
        {
            name: "appointment-frontend",
            cwd: './frontend',
            script: 'npm',
            args: 'run preview -- --host 0.0.0.0 --port 5174',
            instances: 1,
            autorestart: true,
            watch: false,
            // Server has 1.9 GB RAM + 2 GB swap. vite preview is very light.
            max_memory_restart: '200M',
            // Wait 3 s before restarting to avoid crash-loop hammering
            restart_delay: 3000,
            // Only restart on genuine errors, not clean exits (code 0)
            stop_exit_codes: [0],
            env: {
                NODE_ENV: 'production',
            },
            // Persist logs so you can read them after a crash
            out_file: './logs/frontend-out.log',
            error_file: './logs/frontend-err.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            time: true,
        },
        {
            name: "appointment-backend",
            cwd: "./backend",
            interpreter: "/home/shivansh/miniconda3/envs/appointment_allocation/bin/python3",
            script: "start.py",
            exec_mode: "fork",          // DO NOT use cluster mode (CSP state is not fork-safe)
            instances: 1,
            autorestart: true,
            watch: false,
            // Scheduling a large dataset can spike to ~700 MB. Cap at 900M so the
            // OS still has breathing room before it touches the swap file.
            max_memory_restart: '900M',
            // Same crash-loop protection
            restart_delay: 5000,
            stop_exit_codes: [0],
            // Persistent logs
            out_file: './logs/backend-out.log',
            error_file: './logs/backend-err.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            time: true,
        },
    ],
};