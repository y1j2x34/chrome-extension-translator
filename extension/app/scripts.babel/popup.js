import messages from './messages';
import languages from '../languages.json';

let uku = new Ukulele();

class ApplicationController {
    constructor(){
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
        this.status = 'error';
        this.output = {};
    }
    exchanggeLanguage(){
        [this.form.source, this.form.target] = [this.form.target, this.form.source];
    }
    onTextareaKeyup(event) {
        if(event.keyCode === 13) {

        }
    }
}

uku.registerController('app', new ApplicationController());

window.onload = function(){
    uku.init();
};