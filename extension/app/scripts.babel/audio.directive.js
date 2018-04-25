import config from './config';

export default function appAudio(){
    return {
        restrict: 'E',
        template: [
            '<label>',
                '<i class="fa fa-volume-down"></i>',
            '</label>'
        ].join(''),
        controller: angular.noop,
        controllerAs: 'audio',
        replace: true,
        scope: true,
        bindToController: {
            src: '='
        },
        link: (scope, $elm, $attr, ctrl) => {
            const audio = document.createElement('audio');
            $elm.on('mouseenter', () => {
                audio.src = (config.endpoint + ctrl.src).replace(/[\/\\]{2,}/g, '/');
                audio.play();
            });
        }
    };
}