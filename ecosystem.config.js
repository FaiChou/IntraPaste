module.exports = {
  apps: [
    {
      name: 'intrapaste',
      version: '1.0.0',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        TZ: 'Asia/Shanghai',
      },
    },
  ],
}