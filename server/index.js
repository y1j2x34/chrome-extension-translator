const log4js = require('log4js');
const argv = require('./lib/argv');
const Koa = require('koa');
const Router = require('koa-router');
const requireDir = require('require-dir');
const Boom = require('boom');


log4js.configure(require('./log4js.config'));
const logger = log4js.getLogger('app');

const app = new Koa();
const router = new Router();

const ACCEPTED_METHODS = ['get', 'post', 'head', 'options'];

const controllers = requireDir('lib/ctrls')

const wrap = ({handler, url, name}) => {
    return async function (ctx, next) {
        logger.debug('"%s %s" %s', ctx.request.method, url, ctx.headers['user-agent']);
        const ret = await handler.call(this, ctx, ctx.params);
        ctx.body = JSON.stringify(ret);
        ctx.response.type = 'application/json';
    }
}

for(let [filename, controller] of Object.entries(controllers)){
    controller.name = filename.replace('.js', '');
    const method = (controller.method || 'get').toLowerCase();

    if(ACCEPTED_METHODS.indexOf(method) < 0) {
        throw new Error(`Unsupported request method: ${method}, file: ${filename}`);
    }

    router[method](controller.url, wrap(controller));
}

app.use(router.routes());
app.use(router.allowedMethods({
    throw: true,
    notImplemented: () => new Boom.notImplemented(),
    methodNotAllowed: () => new Boom.methodNotAllowed()
}));

app.listen(argv.port);

logger.info(`Server started at port ${argv.port}.`);
