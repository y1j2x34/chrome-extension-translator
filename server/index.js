const argv = require('./lib/argv');
const Koa = require('koa');
const Router = require('koa-router');
const requireDir = require('require-dir');
const Boom = require('boom');

const logger = require('./lib/logger');

const app = new Koa();
const router = new Router();

const ACCEPTED_METHODS = ['get', 'post', 'head', 'options'];

const controllers = requireDir('lib/ctrls')

const wrap = ({handle, url, name}) => {
    return async function (ctx, next) {
        logger.debug('"%s %s" %s', ctx.request.method, url, ctx.headers['user-agent']);
        let resp;
        try {
            const ret = await handle.call(this, ctx, ctx.params);
            if(ret instanceof Buffer) {
                ctx.body = ret;
                ctx.response.type = 'application/otec-stream';
                return;
            }
            resp = {
                errorCode: '0',
                data: ret,
                message: 'success'
            };
        } catch (error) {
            if(error instanceof Error) {
                logger.error('An error occurred while handling request %s: \r\n%s', error.message, error.stack)
                resp = {
                    errorCode: '-1',
                    message: 'Unknown error'
                };
            } else {
                resp = {
                    errorCode: error.errorCode,
                    message: 'API Error'
                };
            }
        }
        ctx.body = JSON.stringify(resp);
        ctx.response.type = 'application/json';
    }
}

const initializePromises = [];

for(let [filename, controller] of Object.entries(controllers)){
    controller.name = filename.replace('.js', '');
    const method = (controller.method || 'get').toLowerCase();

    if(ACCEPTED_METHODS.indexOf(method) < 0) {
        throw new Error(`Unsupported request method: ${method}, file: ${filename}`);
    }

    router[method](controller.url, wrap(controller));
    if(typeof controller.init === 'function') {
        initializePromises.push(controller.init(app));
    }
    logger.debug('mapping controller: [%s] %s', controller.url, controller.method);
}

app.use(router.routes());
app.use(router.allowedMethods({
    throw: true,
    notImplemented: () => new Boom.notImplemented(),
    methodNotAllowed: () => new Boom.methodNotAllowed()
}));

Promise.all(initializePromises).then(() => {
    app.listen(argv.port);
    logger.info(`Server started at port ${argv.port} and with arguments:\r\n ${JSON.stringify(argv, null, 4)}`);
}, (error) => {
    logger.error(`Server start failed because of an error: ${error}`)
    process.exit(-1);
})

