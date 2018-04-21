import en from '../_locales/en/messages.json';
import zh_CN from '../_locales/zh_CN/messages.json';

for(let [key, {message}] of Object.entries(en)) {
    if(!zh_CN[key]) {
        zh_CN[key] = {message};
    }
}

let lang = navigator.language;

const messages = lang === 'zh-CN' || lang == 'zh' ? zh_CN : en;

export default Object.keys(messages).reduce((map, key) => {
    map[key] = messages[key].message;
    return map;
}, {});