module.exports = {
    apps: [
        {
            name: "registry",
            script: 'index.js',
            watch: true,
            exec_mode: "cluster",
            max_memory_restart: "2G",
            cwd: "./src/apps/registry"
        }
    ]
}