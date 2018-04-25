export default function appEditor() {
    return {
        restrict: 'A',
        link: ($scope, $elm) => {
            var elm = $elm[0];
            elm.focus();
            document.execCommand('paste');
        }
    };
}
