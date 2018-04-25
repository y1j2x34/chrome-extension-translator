const youdao = require('../service/youdao');
const argv = require('../argv');
exports.url = '/voice/:query';

exports.method = 'get';

let cache = new class {
    constructor(maxsize) {
        this.queue = [];
        this.seq = 0;
        this.maxsize = maxsize;
    }
    put(key, buffer) {
        if(!!this.get(key)) {
            return;
        }
        let entry = { key, buffer };
        this.queue[this.seq++] = entry;
        if (this.seq >= this.maxsize) {
            this.seq = 0;
        }
    }
    get(k) {
        for (let { key, buffer } of this.queue) {
            if (key === k) {
                return buffer;
            }
        }
    }
}(argv.voiceCacheSize);

exports.handle = async (ctx, { query }) => {
    var api = 'http://openapi.youdao.com/ttsapi';
    let key = query;
    let buffer = cache.get(key);
    if (buffer) {
        return buffer;
    }
    query = Buffer.from(query, 'base64').toString();
    let querymap = query.split('&').reduce((map, kv) => {
        let pair = kv.split('=');
        map[pair[0]] = pair[1];
        return map;
    }, {});
    buffer = await youdao.ttsapi(querymap);
    console.info(buffer);
    if(buffer instanceof Buffer) {
        cache.put(key, buffer);
    }
    return buffer;
};
