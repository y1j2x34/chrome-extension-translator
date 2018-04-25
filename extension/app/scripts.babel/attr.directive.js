import app from './app.module';

export default function appAttrs(){
    return {
        restrict: 'A',
        controller: angular.noop,
        controllerAs: 'ctrl',
        scope: true,
        bindToController: {
            attrs: '=' + appAttrs.name
        },
        link: {
            pre: (scope, element, $attr, ctrl) => {
                if(typeof ctrl.attrs === 'object') {
                    for(let [key,value] of Object.entries(ctrl.attrs)){
                        $attr.$set(key, value);
                    }
                }
            }
        }
    };
}