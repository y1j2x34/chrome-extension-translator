import messages from './messages';
import languages from '../languages.json';

class ApplicationController {
    static get $inject() {
        return ['$scope', '$http'];
    }
    constructor(scope, http) {
        this.http = http;
        this.locale = messages;
        this.languages = languages.map(lang => ({
            value: lang,
            name: messages['lang_' + lang]
        }));
        this.form = {
            source: 'auto',
            target: 'auto'
        };
        this.text = '';
        this.status = '';
        this.output = {};
        let languageChanged = () => {
            if(this.text.trim().length > 0) {
                this.handleTranslation();
            }
        };
        scope.$watch(() => this.form.source + this.form.target, languageChanged);
    }
    exchanggeLanguage() {
        [this.form.source, this.form.target] = [this.form.target, this.form.source];
    }
    onTextareaKeyup(event) {
        if (event.keyCode === 13) {
            this.handleTranslation();
        }
    }
    handleTranslation(){
        this.status = 'loading';
            this.requestTranslation().then(data => {
                this.output = data;
                if(data.errorCode !== '0') {
                    this.status = 'error';
                    this.output.message = messages['code_'+data.errorCode] || messages.unkown_error;
                } else {
                    this.status = 'success';
                }
            }, (err) => {
                this.status = 'error';
                this.output = {
                    message: messages.unkown_error
                }
            });
    }
    requestTranslation() {
        let {source, target} = this.form;
        if(target === 'auto') {
            target = navigator.language;
        }
        return this.http.get(`translate/${source}/${target}/${encodeURIComponent(this.text)}`).then(({data}) => data.data || data);
    }
}
export default ApplicationController;
