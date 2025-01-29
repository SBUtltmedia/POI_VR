const { spawn, exec } = require("child_process");

exec("./node_modules/typescript/bin/tsc", function (err, stdout, stderr) {
    console.log(stdout);
});
exec("./node_modules/.bin/vite  build --watch ", function (err, stdout, stderr) {
    console.log(stdout);
});
exec("node server.js ", function (err, stdout, stderr) {
    console.log(stdout);
});