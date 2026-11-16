module.exports = {
  apps: [
    {
      name: 'soul-server',
      script: 'apps/server/dist/index.js',
      cwd: '/var/www/soul',
      env_file: '.env.production',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '512M',
      autorestart: true,
      watch: false,
      kill_timeout: 5000,
      listen_timeout: 10000,
      merge_logs: true,
      time: true
    }
  ]
};
