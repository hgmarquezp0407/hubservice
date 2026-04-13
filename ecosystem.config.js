// PRODUCTION

module.exports = {
  apps: [{
    name: 'nextjs-frontend',
    script: 'node_modules/next/dist/bin/next',  // ← Llamo directamente a Next.js
    args: 'start -p 3946',  // ← Puerto aquí
    cwd: '/home/epidev/htdocs/denguesanmartin.online/epidev',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: '/home/epidev/logs/nextjs/error.log',
    out_file: '/home/epidev/logs/nextjs/out.log',
    env: {
      NODE_ENV: 'production'
    }
  }]
};

// DEVELOPMENT

// module.exports = {
//   apps: [{
//     name: 'nextjs-frontend',
//     script: 'npm',
//     args: 'run dev',
//     cwd: '/home/epidev/htdocs/denguesanmartin.online/htdocs',
//     instances: 1,
//     autorestart: true,
//     watch: false,
//     error_file: '/home/epidev/logs/nextjs/error.log',
//     out_file: '/home/epidev/logs/nextjs/out.log',
//     env: {
//       NODE_ENV: 'development',
//       PORT: 3946
//     }
//   }]
// };
