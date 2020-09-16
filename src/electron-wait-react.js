// adapted from https://medium.com/better-programming/how-to-build-an-electron-app-with-reactjs-488fdd532bd4
const net = require('net');
const port = process.env.PORT ? (process.env.PORT - 100) : 3000;
process.env.ELECTRON_START_URL = `http://localhost:${port}`;
const client = new net.Socket();
let startedElectron = false;
const tryConnection = () => client.connect({port: port}, () => {
    client.end();
    if(!startedElectron) {
        console.log('starting electron');
        startedElectron = true;
        const { spawn } = require('child_process');
        const ls = spawn('npm run electron', [], { shell: true });
        ls.stdout.on('data', (data) => {
            console.log(`${data}`);
        });
        ls.stderr.on('data', (data) => {
            console.error(`err: ${data}`);
        });
        ls.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });
    }
});
tryConnection();
client.on('error', (error) => {
    setTimeout(tryConnection, 1000);
});