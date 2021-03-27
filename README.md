# electron-vue-ts

### Build Setup

``` bash
# need node@>=8.15.0
nvm use 8.15.0

# install dependencies
npm install

# rebuild sqlite native modules
cd ./node_modules/sqlite3-electron && HOME=~/.electron-gyp node-gyp rebuild --target=11.4.1 --arch=x64 --dist-url=https://atom.io/download/electron && cd ../../

# serve with hot reload at localhost:9080
npm run dev


# build electron application for production
npm run build

# build electron application for stg
npm run build:stg

# run unit & end-to-end tests
npm test

# lint all JS/TS/Vue component files in `src/`
npm run lint

# lint and fix all JS/TS/Vue component files in `src/`
npm run lint:fix

```