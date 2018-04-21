const request = require('request');
const MD5 = require('md5.js');
const {promisify} = require('util');

module.exports = class Youdao {
    constructor(apiKey, secretKey, endpoint = 'http://openapi.youdao.com/api'){
        this.apiKey = apiKey;
        this.secretKey = secretKey;
        this.endpoint = endpoint;
    }
    async request(from='auto', to='EN', text) {
        const salt = Math.random().toString(16).slice(2);
        const sign = new MD5().update(this.apiKey + text + salt + this.secretKey).digest('hex');
        const {body} = await promisify(request)(this.endpoint, {
            headers: {},
            qs: {
                q: text,
                from: from,
                to: to,
                appKey: this.apiKey,
                salt: salt,
                sign: sign,
                ext: 'mp3',
                voice: 0
            }
        });
        return JSON.parse(body);
    }
};