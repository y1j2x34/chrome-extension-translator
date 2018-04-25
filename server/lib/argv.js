const package = require('../package.json');
const program = require('commander');

const parsePort = (str) => {
    const port = parseInt(str);
    if(isNaN(port) || !isFinite(port) || port < 1 || port > 65535) {
        return package.config.port;
    }
    return port;
}


program
.version(package.version)
.option('-p, --port <port>', 'Port of this server', parsePort)
.option('-s, --storage <path>', 'Path of sqlite database file.')
.parse(process.argv)

module.exports = {
    port: program.port || package.config.port,
    storage: program.storage || package.config.storage
};