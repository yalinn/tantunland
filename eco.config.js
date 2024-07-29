module.exports = {
    apps: [
        /* {
            name: "registry",
            script: "./index.js",
            exec_mode: "cluster",
            interpreter: "./node_modules/.bin/ts-node",
            interpreter_args: "--require ts-node/register/transpile-only --require tsconfig-paths/register",
            merge_logs: true,
            max_restarts: 10,
            watch: true,
            cwd: "./src/apps/registry",
        },
        {
            name: "guardian",
            script: "./index.js",
            exec_mode: "cluster",
            interpreter: "./node_modules/.bin/ts-node",
            interpreter_args: "--require ts-node/register/transpile-only --require tsconfig-paths/register",
            merge_logs: true,
            max_restarts: 10,
            watch: true,
            cwd: "./src/apps/guardian",
        }, */
        {
            name: "preserver",
            script: "./index.js",
            exec_mode: "cluster",
            interpreter: "./node_modules/.bin/ts-node",
            interpreter_args: "--require ts-node/register/transpile-only --require tsconfig-paths/register",
            merge_logs: true,
            max_restarts: 10,
            watch: true,
            cwd: "./src/apps/preserver",
        }
    ]
}