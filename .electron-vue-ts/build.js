'use strict';

const chalk = require('chalk');
const webpack = require('webpack');
const VueService = require('@vue/cli-service')
const minimist = require('minimist')
const mainConfig = require('./webpack.main.config');
const workerConfig = require('./webpack.worker.config');
const childProcessConfig = require('./webpack.childProcess.config');
const NODE_ENV = process.env.NODE_ENV

async function buildRenderer() {
  console.log('\n', chalk.yellow.bold('Renderer Process:'), chalk.white.bold('Compiling'), '\n');
  const service = new VueService(process.cwd())
  const rawArgv = NODE_ENV === 'test' ? ['build', '--mode', 'stg'] : ['build', '--mode', 'prod']
  const args = minimist(rawArgv, {
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
      'verbose',
    ]
  })
  const command = args._[0]
  await service.run(command, args, rawArgv)
  console.log('\n', chalk.yellow.bold('Renderer Process:'), chalk.blue.bold('Compile completed'), '\n');
  return true
}

function buildWorker() {
  return new Promise((resolve, reject) => {
    console.log('\n', chalk.yellow.bold('Worker Process:'), chalk.white.bold('compiling...'), '\n');

    const compiler = webpack(workerConfig);

    compiler.hooks.done.tapAsync('done', (stats) => {
      console.log('\n', chalk.yellow.bold('Worker Process:'), chalk.blue.bold('Compile completed'), '\n');
      resolve(true)
    })

    compiler.hooks.failed.tap('failed', (error) => {
      console.log('\n', chalk.yellow.bold('Worker Process:'), chalk.blue.bold('Compile error'), '\n');
      console.error(error)
      reject(error)
    })
  });
}

function buildChildProcess() {
  return new Promise((resolve, reject) => {
    console.log('\n', chalk.yellow.bold('Child Process:'), chalk.white.bold('compiling...'), '\n');

    const compiler = webpack(childProcessConfig);

    compiler.hooks.done.tapAsync('done', (stats) => {
      console.log('\n', chalk.yellow.bold('Child Process:'), chalk.blue.bold('Compile completed'), '\n');
      resolve(true)
    })

    compiler.hooks.failed.tap('failed', (error) => {
      console.log('\n', chalk.yellow.bold('Child Process:'), chalk.blue.bold('Compile error'), '\n');
      console.error(error)
      reject(error)
    })
  });
}

function buildMain() {
  return new Promise((resolve, reject) => {
    console.log('\n', chalk.yellow.bold('Main Process:'), chalk.white.bold('compiling...'), '\n');

    const compiler = webpack(mainConfig);

    compiler.hooks.done.tapAsync('done', (stats) => {
      console.log('\n', chalk.yellow.bold('Main Process:'), chalk.blue.bold('Compile completed'), '\n');
      resolve(true)
    })

    compiler.hooks.failed.tap('failed', (error) => {
      console.log('\n', chalk.yellow.bold('Main Process:'), chalk.blue.bold('Compile error'), '\n');
      console.error(error)
      reject(error)
    })
  });
}

async function init() {
  await buildMain()
  await buildChildProcess()
  await buildWorker()
  await buildRenderer()
};

init().catch(err => {
  console.error('\n', chalk.red.bold('Build Electron App Error'), '\n');
  console.error(err)
  process.exit(1)
})
