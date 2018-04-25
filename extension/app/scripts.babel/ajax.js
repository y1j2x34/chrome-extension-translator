export default class Ajax {
    constructor(endpoint) {
        this.endpoint = endpoint;
    }
    /**
     * @private
     *
     * @param {string} url
     * @param {string} [method='GET']
     * @param {Object} queries
     * @param {Object.<string, string|string[]>} headers
     * @memberof Ajax
     */
    request(url, method = 'GET', queries = {}, headers = {}) {
        const xhr = new XMLHttpRequest();
        let qs = [];
        for(let [key, value] of Object.entries(queries)) {
            qs.push(`${key}=${value}`);
        }
        url = (this.endpoint + '/' + url).replace(/[\/\\]+/g, '/');
        if(url.indexOf('?') == -1) {
            url += '?'
        } else {
            url += '&';
        }
        return new Promise((resolve, reject) => {
            xhr.onload = (xhr, e) => {
                console.info(xhr, e);
                resolve(e);
            };
            xhr.onerror = (xhr, err) => {
                reject(err);
            };
            xhr.open(method, url + qs.join('&'));
            xhr.send();
        });
    }
    async get(url, queries = {}, headers = {}) {
        return await this.request(url,'GET', queries, headers);
    }
}
