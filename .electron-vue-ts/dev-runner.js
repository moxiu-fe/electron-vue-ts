'use strict';

const chalk = require('chalk');
const path = require('path');
const webpack = require('webpack');
const VueService = require('@vue/cli-service')
const minimist = require('minimist')
const runElectron = require('./run-electron')
const mainConfig = require('./webpack.main.config');
const childProcessConfig = require('./webpack.childProcess.config');
const workerConfig = require('./webpack.worker.config');

let electronProcess = null;
let manualRestart = false;

async function startRenderer() {
  console.log('\n', chalk.yellow.bold('Renderer Process:'), chalk.white.bold('Compiling'), '\n');
  const service = new VueService(process.cwd())
  const rawArgv = ['serve']
  const args = minimist(['serve'], {
    boolean: [
      // build
      'modern',
      'report',
      'report-json',
      'inline-vue',
      'watch',
      // serve
      'open',
      'copy',
      'https',
      // inspect
      'verbose'
    ]
  })
  const command = args._[0]
  await service.run(command, args, rawArgv)
  console.log('\n', chalk.yellow.bold('Renderer Process:'), chalk.blue.bold('Compile completed'), '\n');
  return true
}

// worker 无热更新功能
function startWorker() {
  return new Promise((resolve, reject) => {
    const compiler = webpack(workerConfig);
    compiler.hooks.watchRun.tapAsync('watch-run', (compilation, done) => {
      console.log('\n', chalk.yellow.bold('Worker Process:'), chalk.white.bold('compiling...'), '\n');
      done();
    });

    compiler.watch({}, (err, stats) => {
      if (err) {
        console.error(err.stack || err);
        if (err.details) {
          console.error(err.details);
        }
        return;
      }
      const info = stats.toJson();
      if (stats.hasErrors()) {
        console.error(info.errors);
      }
      if (stats.hasWarnings()) {
        console.warn(info.warnings);
      }
      console.log('\n', chalk.yellow.bold('Worker Process:'), chalk.blue.bold('Compile completed'), '\n');

      // 重新启动
      if (electronProcess && electronProcess.kill) {
        manualRestart = true;
        process.kill(electronProcess.pid);
        electronProcess = null;
        startElectron();

        setTimeout(() => {
          manualRestart = false;
        }, 5000);
      }

      resolve(true);
    });

    compiler.hooks.failed.tap('failed', (error) => {
      console.log('\n', chalk.yellow.bold('Worker Process:'), chalk.blue.bold('Compile error'), '\n');
      console.error(error)
      reject(error)
    })
  });
}

function startChildProcess() {
  return new Promise((resolve, reject) => {
    const compiler = webpack(childProcessConfig);

    compiler.hooks.watchRun.tapAsync('watch-run', (compilation, done) => {
      console.log('\n', chalk.yellow.bold('Child Process:'), chalk.white.bold('compiling...'), '\n');
      done();
    });

    compiler.watch({}, (err, stats) => {
      if (err) {
        console.error(err.stack || err);
        if (err.details) {
          console.error(chalk.yellow.red(err.details));
        }
        return;
      }
      const info = stats.toJson();
      if (stats.hasErrors()) {
        console.error(chalk.yellow.red(info.errors));
      }
      if (stats.hasWarnings()) {
        // console.warn(chalk.yellow.bold(info.warnings));
      }

      console.log('\n', chalk.yellow.bold('Child Process:'), chalk.blue.bold('Compile completed'), '\n');

      // 重新启动
      if (electronProcess && electronProcess.kill) {
        manualRestart = true;
        process.kill(electronProcess.pid);
        electronProcess = null;
        startElectron();

        setTimeout(() => {
          manualRestart = false;
        }, 5000);
      }

      resolve(true)
    });

    compiler.hooks.failed.tap('failed', (error) => {
      console.log('\n', chalk.yellow.bold('Child Process:'), chalk.blue.bold('Compile error'), '\n');
      console.error(error)
      reject(error)
    })
  });
}

function startMain() {
  return new Promise((resolve, reject) => {
    const compiler = webpack(mainConfig);

    compiler.hooks.watchRun.tapAsync('watch-run', (compilation, done) => {
      console.log('\n', chalk.yellow.bold('Main Process:'), chalk.white.bold('compiling...'), '\n');
      done();
    });

    compiler.watch({}, (err, stats) => {
      if (err) {
        console.error(err.stack || err);
        if (err.details) {
          console.error(chalk.yellow.red(err.details));
        }
        return;
      }
      const info = stats.toJson();
      if (stats.hasErrors()) {
        console.error(chalk.yellow.red(info.errors));
      }
      if (stats.hasWarnings()) {
        // console.warn(chalk.yellow.bold(info.warnings));
      }

      console.log('\n', chalk.yellow.bold('Main Process:'), chalk.blue.bold('Compile completed'), '\n');

      // 重新启动
      if (electronProcess && electronProcess.kill) {
        manualRestart = true;
        process.kill(electronProcess.pid);
        electronProcess = null;
        startElectron();

        setTimeout(() => {
          manualRestart = false;
        }, 5000);
      }

      resolve(true)
    });

    compiler.hooks.failed.tap('failed', (error) => {
      console.log('\n', chalk.yellow.bold('Main Process:'), chalk.blue.bold('Compile error'), '\n');
      console.error(error)
      reject(error)
    })
  });
}

function startElectron() {
  console.log('\n', chalk.yellow.bold('Start Electron App:'), chalk.blue.bold('starting'), '\n');

  var args = ['--inspect=5858', path.join(__dirname, '../app/main/main.js')];

  if (process.env.npm_execpath.endsWith('yarn.js')) {
    args = args.concat(process.argv.slice(3));
  } else if (process.env.npm_execpath.endsWith('npm-cli.js')) {
    args = args.concat(process.argv.slice(2));
  }

  electronProcess = runElectron(args)

  electronProcess.stderr.on('data', data => {
    electronLog(data, 'red');
  });

  electronProcess.on('close', () => {
    console.log('\n', chalk.yellow.bold('Electron App Closed'), '\n');
    if (!manualRestart) process.exit();
  });
  console.log('\n', chalk.yellow.bold('Start Electron App:'), chalk.blue.bold('started'), '\n');
}

function electronLog(data, color) {
  let log = '';
  data = data.toString().split(/\r?\n/);
  data.forEach(line => {
    log += `  ${line}\n`;
  });
  if (/[0-9A-z]+/.test(log)) {
    console.log(
      chalk[color].bold('┏ Electron -------------------') +
      '\n\n' +
      log +
      chalk[color].bold('┗ ----------------------------') +
      '\n'
    );
  }
}

async function init() {
  await startWorker()
  await startRenderer()
  await startChildProcess()
  await startMain()
  startElectron();
}

init().catch(err => {
  console.error('\n', chalk.red.bold('Start Electron App Error'), '\n');
  console.error(err)
  process.exit(1)
})
