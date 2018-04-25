const {parse} = require('url')
const TranslationCache = require('../TranslationCache');
const youdao = require('../service/youdao');
const logger = require('../logger');

const cache = new TranslationCache('YOUDAO_TRANSLATION');

exports.url = '/translate/:from/:to/:text';
exports.method = 'get';
exports.init = async () => await cache.initialize();

function resolveSpeakUrl(url){
    if(!url) {
        return url;
    }
    let parsedURL = parse(url);
    return '/voice/' + Buffer.from(parsedURL.query).toString('base64');
}

function resolveVoice(result){
    result.speakUrl = resolveSpeakUrl(result.speakUrl);
    result.tSpeakUrl = resolveSpeakUrl(result.tSpeakUrl);
    let basic = result.basic;

    if(basic && basic['uk-speech']){
        basic['uk-speech'] = resolveSpeakUrl(basic['uk-speech']);
    }
    if(basic && basic['us-speech']) {
        basic['us-speech'] = resolveSpeakUrl(basic['us-speech']);
    }
}
exports.handle = async (ctx, {from, to, text}) => {
    let result = await cache.getCache(from, to, text);
    if(result) {
        logger.info('cache hit: %s, %s, %s',from, to, text );
        resolveVoice(result.target);
        return result.target;
    } else {
        logger.warn('cache not hit: %s, %s, %s',from, to, text );
    }
    result = await youdao.translate(text, from, to);
    resolveVoice(result);

    let {basic,errorCode, query, speakUrl, tSpeakUrl, translation, web} = result;
    if(errorCode !== "0") {
        throw {errorCode};
    }
    console.info(basic);
    let ret = {basic,errorCode, query, speakUrl, tSpeakUrl, translation, web};
    cache.putCache(from, to, text, ret);
    return ret;
};