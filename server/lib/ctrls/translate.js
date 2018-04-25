const Youdao = require('../apis/youdao');
const apiKey = require('../../apikey');
const TranslationCache = require('../TranslationCache');
const logger = require('../logger');

const youdao = new Youdao(apiKey.apiKey, apiKey.secretKey);

const cache = new TranslationCache('YOUDAO_TRANSLATION');

exports.url = '/translate/:from/:to/:text';
exports.method = 'get';
exports.init = async () => await cache.initialize();

exports.handle = async (ctx, {from, to, text}) => {
    let result = await cache.getCache(from, to, text);
    if(result) {
        logger.info('cache hit: %s, %s, %s',from, to, text );
        return result.target;
    } else {
        logger.warn('cache not hit: %s, %s, %s',from, to, text );
    }
    result = await youdao.translate(text, from, to);
    let {basic,errorCode, query, speakUrl, tSpeakUrl, translation, web} = result;
    if(errorCode !== "0") {
        throw {errorCode};
    }
    let ret = {basic,errorCode, query, speakUrl, tSpeakUrl, translation, web};
    cache.putCache(from, to, text, ret);
    return ret;
};