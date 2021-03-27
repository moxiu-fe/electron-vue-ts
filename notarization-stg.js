// See: https://medium.com/@TwitterArchiveEraser/notarize-electron-apps-7a5f988406db

const fs = require('fs');
const path = require('path');
// eslint-disable-next-line camelcase
const electron_notarize = require('electron-notarize');

// eslint-disable-next-line space-before-function-paren
module.exports = async function (params) {
  // Only notarize the app on Mac OS only.
  if (process.platform !== 'darwin') {
    return;
  }
  console.log('afterSign hook triggered', params);

  // Same appId in electron-builder.
  let appId = 'com.mydomain.electron-vue-ts';

  let appPath = path.join(params.appOutDir, `${params.packager.appInfo.productFilename}.app`);
  if (!fs.existsSync(appPath)) {
    throw new Error(`Cannot find application at: ${appPath}`);
  }

  console.log(`Notarizing ${appId} found at ${appPath}`);

  try {
    await electron_notarize.notarize({
      appBundleId: appId,
      appPath: appPath,
      ascProvider: 'your appIds ascProvider', // your appId's ascProvider
      appleId: 'your appId', // your appId
      appleIdPassword: 'your appleId password' // your appleId password
    });
  } catch (error) {
    console.error(error);
  }

  console.log(`Done notarizing ${appId}`);
};
