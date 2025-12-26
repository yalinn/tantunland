module.exports = {
    apps: [
        /* {
            name: "registry",
            cwd: "/root/github/tantunland",
            script: "src/apps/registry/index.js",
            exec_mode: "fork",
            interpreter: "/root/github/tantunland/node_modules/.bin/ts-node",
            interpreter_args: "--transpile-only --require tsconfig-paths/register",
            watch: false,
            merge_logs: true,
            max_restarts: 10,
        }, */
        {
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
        /* {
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
        /* {
            name: "preserver",
            script: "./index.js",
            exec_mode: "cluster",
            interpreter: "./node_modules/.bin/ts-node",
            interpreter_args: "--require ts-node/register/transpile-only --require tsconfig-paths/register",
            merge_logs: true,
            max_restarts: 10,
            watch: true,
            cwd: "./src/apps/preserver",
        } */
    ]
}