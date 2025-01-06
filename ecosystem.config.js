module.exports = {
  apps: [
    {
      name: 'intrapaste',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        TZ: 'Asia/Shanghai',
      },
    },
  ],
}