const { archive } = require('app-builder-lib/out/targets/archive');
const { hashFile } = require('app-builder-lib/out/util/hash');
const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const yaml = require('js-yaml');

// eslint-disable-next-line space-before-function-paren
module.exports = async function (params) {
  // Only archive zip the app on Mac OS only.
  if (process.platform !== 'darwin') {
    return;
  }

  console.log('afterAllArtifactBuild hook triggered', params);

  let appPath = path.join(params.outDir, `mac/${params.configuration.productName}.app`);
  if (!fs.existsSync(appPath)) {
    throw new Error(`Cannot find application at: ${appPath}`);
  }

  let outZipPath = params.artifactPaths.find(item => item.endsWith('.zip'));

  if (!fs.existsSync(appPath)) {
    fse.createFileSync(appPath);
  }

  try {
    console.log('archive zip');
    await archive('zip', outZipPath, appPath, { compression: 'normal', withoutDir: false });

    // eslint-disable-next-line space-before-function-paren
    setTimeout(async () => {
      // eslint-disable-next-line space-before-function-paren
      const sha512 = await hashFile(outZipPath);
      console.log(`hash file ${outZipPath} with sha512 result ${sha512}`);

      const size = fs.statSync(outZipPath).size;
      const ymlPath = path.join(params.outDir, 'latest-mac.yml');
      const doc = yaml.safeLoad(fs.readFileSync(ymlPath, 'utf8'));
      doc.sha512 = sha512;
      doc.files.forEach(item => {
        if (item.url.endsWith('.zip')) {
          item.sha512 = sha512;
          item.size = size;
        }
      });

      fs.writeFileSync(ymlPath, yaml.safeDump(doc, { lineWidth: 200 }), { encoding: 'utf8', flag: 'w' });

      console.log('Done archive zip');
    }, 1000);
  } catch (err) {
    console.error(err);
  }
};
