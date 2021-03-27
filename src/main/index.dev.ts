import { app, session } from 'electron';
import electronDebug from 'electron-debug';
import path from 'path';

import './index';

electronDebug({ showDevTools: true, devToolsMode: 'detach' });

app.on('ready', () => {
  const devToolsExt = session.defaultSession.getAllExtensions();
  if (!devToolsExt['Vue.js devtools']) {
    session.defaultSession.loadExtension(path.resolve(__dirname, '../devToolsExtensions/vue-devtools/vender'))
      .catch(err => console.error(err));
  }

  if (!devToolsExt['devtron']) {
    session.defaultSession.loadExtension(path.resolve(__dirname, '../devToolsExtensions/devtron'))
      .catch(err => console.error(err));
  }
});
