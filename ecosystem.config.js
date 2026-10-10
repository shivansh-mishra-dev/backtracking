module.exports = {
    apps: [
        {
            name: "appointment-allocation-frontend",
            cwd: './frontend',
            script: 'npm',
            args: 'run dev -- --host 0.0.0.0 --port 5174',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '500M',
            env: {
                NODE_ENV: 'development',
                PORT: 5174,
            },
            env_production: {
                NODE_ENV: 'production',
                script: 'npm',
                args: 'run preview -- --host 0.0.0.0 --port 5174',
                PORT: 5174,
            },
            time: true,
        },
        {
            name: "appointment-allocation-backend",
            cwd: "./backend",
            interpreter: "/home/shivansh/miniconda3/envs/appointment_allocation/bin/python3",
            script: "start.py",
            exec_mode: "fork",        // DO NOT use cluster mode
            instances: 1,
            autorestart: true,
            watch: false,
        },
    ],
};