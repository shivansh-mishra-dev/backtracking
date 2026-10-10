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
            // Vite preview is very light; 300M is generous ceiling
            max_memory_restart: '300M',
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
            // t3.micro has 1 GB total; cap the backend at 600 MB to leave room for the OS
            max_memory_restart: '600M',
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