const package = require('../package.json');
const program = require('commander');

const parsePort = (str) => {
    const port = parseInt(str);
    if(isNaN(port) || !isFinite(port) || port < 1 || port > 65535) {
        return package.config.port;
    }
    return port;
}
const parseVoiceCacheSize = (str) => {
    const size = parseInt(str);
    if(isNaN(size) || port < 1 || port > 1024 * 1024) {
        return package.config.voiceCacheSize;
    }
    return size;
}
const parseBoolean = (str) => {

}

program
.version(package.version)
.option('-p, --port <port>', 'Port of this server', parsePort)
.option('-s, --storage <path>', 'Path of sqlite database file.')
.option('-v, --vsize <size>', 'Max size of voice cache', parseVoiceCacheSize)
.option('--no-log-sql', 'Disable sql logging')
.parse(process.argv)

module.exports = {
    port: program.port || package.config.port,
    storage: program.storage || package.config.storage,
    voiceCacheSize: program.vsize || package.config.voiceCacheSize,
    loggingSql: program.logSql
};