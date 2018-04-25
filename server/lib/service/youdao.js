const apiKey = require('../../apikey');
const Youdao = require('../apis/youdao');

module.exports = new Youdao(apiKey.apiKey, apiKey.secretKey);