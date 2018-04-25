const package = require('../package.json');
const log4js = require('log4js');

log4js.configure(package.log4js);
module.exports = log4js.getLogger('app');