var app = angular.module('app', ['ng'])

app.bootstrap = () => {
    angular.bootstrap(document.body, [app.name], {});
}

export default app;