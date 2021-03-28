# electron-vue-ts
## The boilerplate for making electron applications built with vue and typescript. ##

<img width="500" src="/screenshot.png" alt="electron-vue">

### Overview
The aim of this project is to remove the need of manually setting up electron apps using vue and typescript.

### Getting Started

``` bash
# clone this project
git clone https://github.com/moxiu-fe/electron-vue-ts.git

# install dependencies
npm install

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production
npm run build

# build electron application for stg
npm run build:stg

# run unit & end-to-end tests
npm test

# lint and fix all JS/TS/Vue component files in `src/`
npm run lint
```
### Feature list

- Basic project structure with a single package.json setup
- Basic eLectron v11.4.1、vue.js v2.6.12、typescript v3.8.3
- Ready to use Vue plugins (axios, vue-router, vuex)
- Installed vue-devtools and devtron tools for development
- Ability to easily package your electron app using electron-builder
- Use of webpack build Child Process & Web Worker code
- Notarizing your application
- Automatically update your application. with electron-updater
- Handy NPM scripts
- Hot Module Replacement
- Process restarting when working in main process

### Todo
- IPC management

