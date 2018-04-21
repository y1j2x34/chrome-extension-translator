const Youdao = require('../apis/youdao');
const apiKey = require('../../apikey');

const youdao = new Youdao(apiKey.apiKey, apiKey.secretKey);

exports.url = '/translate/:from/:to/:text';
exports.method = 'get';

exports.handler = (ctx, {from, to, text}) => {
    return youdao.request(from, to, text);
};