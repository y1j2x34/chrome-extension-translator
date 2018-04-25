import app from './app.module';
import config from './config';

httpProviderConfigure.$inject = ['$httpProvider'];

app.config(httpProviderConfigure);

function httpProviderConfigure($httpProvider) {
    $httpProvider.interceptors.push(handleHttpRequestInterceptor, handleHttpResponseInterceptor);
    handleHttpRequestInterceptor.$inject = ['$q'];
    handleHttpResponseInterceptor.$inject = ['$q'];

    function handleHttpRequestInterceptor($q) {
        return { request };
        function request(requestConfig) {
            requestConfig.url = config.endpoint + requestConfig.url;
            return $q.when(requestConfig);
        }
    }
    function handleHttpResponseInterceptor($q) {
        return { responseError };
        function responseError(response) {
            return $q.reject(response);
        }
    }
}
