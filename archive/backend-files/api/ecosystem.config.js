module.exports = {
  apps: [
    {
      name: 'reweave-api',
      script: './dist/index.js',
      instances: 'max', // Use all available CPUs
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOST: '0.0.0.0'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOST: '0.0.0.0'
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      max_memory_restart: '1G', // Restart if memory exceeds 1GB
      max_restarts: 10, // Maximum number of restarts
      min_uptime: '10s', // Minimum uptime before considered successful
      max_memory_restart: '500M', // Restart if memory exceeds 500MB
      kill_timeout: 5000, // Time to wait before force killing
      listen_timeout: 3000, // Time to wait for app to start
      shutdown_with_message: true,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      log_type: 'json',
      combine_logs: true,
      // Health monitoring
      health_check_url: 'http://localhost:3001/health',
      health_check_grace_period: 3000,
      // Auto restart on file changes (disabled in production)
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'dist'],
      // Environment specific
      env_development: {
        NODE_ENV: 'development',
        PORT: 3001,
        watch: true,
        ignore_watch: ['node_modules', 'logs', 'dist']
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 3001,
        instances: 2
      }
    },
    {
      name: 'reweave-worker',
      script: './dist/workers/index.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        WORKER_TYPE: 'background'
      },
      error_file: './logs/worker-err.log',
      out_file: './logs/worker-out.log',
      log_file: './logs/worker-combined.log',
      time: true,
      max_memory_restart: '500M',
      watch: false
    }
  ],

  deploy: {
    production: {
      user: 'node',
      host: 'api.reweave.my',
      ref: 'origin/main',
      repo: 'git@github.com:your-org/reweave-api.git',
      path: '/var/www/reweave-api',
      'post-deploy': 'pnpm install && pnpm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'apt-get install git && apt-get install pnpm',
      'post-setup': 'pnpm install && pnpm run build',
      env: {
        NODE_ENV: 'production'
      }
    },
    staging: {
      user: 'node',
      host: 'staging.reweave.my',
      ref: 'origin/develop',
      repo: 'git@github.com:your-org/reweave-api.git',
      path: '/var/www/reweave-api-staging',
      'post-deploy': 'pnpm install && pnpm run build && pm2 reload ecosystem.config.js --env staging',
      env: {
        NODE_ENV: 'staging'
      }
    }
  }
}