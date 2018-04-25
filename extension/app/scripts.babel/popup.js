import app from './app.module';
import './app.config';
import ApplicationController from './app.controller';
import attrDirective from './attr.directive';
import appEditorDirective from './editor.directive';
import appAudioDirective from './audio.directive';

app.controller(ApplicationController.name, ApplicationController);
app.directive(attrDirective.name, attrDirective);
app.directive(appEditorDirective.name, appEditorDirective);
app.directive(appAudioDirective.name, appAudioDirective);

app.bootstrap();