const { Writable } = require('stream');

const MD5 = require('md5.js');
const { promisify } = require('util');
const request = require('request');

let normalizeLan = lang => {
    if (typeof lang !== 'string') return 'auto';
    switch (lang) {
        case 'zh':
        case 'zh_CN':
        case 'zh-CN':
            return 'zh-CHS';
        case 'en':
        case 'en-US':
        case 'en_US':
            return 'EN';
    }
    return lang;
};

module.exports = class Youdao {
    constructor(apiKey, secretKey, endpoint = 'http://openapi.youdao.com') {
        this.apiKey = apiKey;
        this.secretKey = secretKey;
        this.endpoint = endpoint;
    }
    async ttsapi(query) {
        const resp = await promisify(request)(this.endpoint + '/ttsapi', {
            qs: query,
            encoding: null
        });
        if(resp.headers['content-type'] !== 'audio/mp3') {
            return JSON.parse(resp.body.toString('utf8'));
        } else {
            return resp.body;
        }
    }
    async translate(text, from = 'auto', to = 'EN') {
        from = normalizeLan(from);
        to = normalizeLan(to);
        const salt = Math.random()
            .toString(16)
            .slice(2);
        const sign = new MD5().update(this.apiKey + text + salt + this.secretKey).digest('hex');
        const resp = await promisify(request)(this.endpoint + '/api/', {
            headers: {},
            qs: {
                q: text,
                from: from,
                to: to,
                appKey: this.apiKey,
                salt: salt,
                sign: sign,
                ext: 'mp3',
                voice: 1
            }
        });
        return JSON.parse(resp.body);
    }
};
