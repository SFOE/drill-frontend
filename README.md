![Lint](https://github.com/sfoe/drill-frontend/actions/workflows/lint.yml/badge.svg)
![Tests](https://github.com/sfoe/drill-frontend/actions/workflows/test.yml/badge.svg)


# drill-frontend

Vue.js application with a mapping component to provide information on the possibilities of installing geothermal probes in Switzerland, using the cantons' geoservices.

## Project Setup

### Backend

ℹ️ This vuejs app needs a backend to work. 

The backend is published here, please follow instructions:  [https://github.com/SFOE/drillapi/pkgs/container/drillapi](https://github.com/SFOE/drillapi)

A docker image can also be pulled from https://github.com/SFOE/drillapi/pkgs/container/drillapi


### Install vuejs dev environnement

This project uses node. Checkout official documentation in order to manage node versions correctly with Node Version Manager (NVM) at https://nodejs.org/en/download

```sh
git clone git@github.com:SFOE/drill-frontend.git
```

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Upgrade packages

```sh
npx npm-check-updates -u
npm install
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

### Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run End-to-End Tests with [Cypress](https://www.cypress.io/)

```sh
npm run test:e2e:dev
```

This runs the end-to-end tests against the Vite development server.
It is much faster than the production build.

But it's still recommended to test the production build with `test:e2e` before deploying (e.g. in CI environments):

```sh
npm run build
npm run test:e2e
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
