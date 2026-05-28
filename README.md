![Lint](https://github.com/sfoe/drill-frontend/actions/workflows/lint.yml/badge.svg)
![Tests](https://github.com/sfoe/drill-frontend/actions/workflows/e2e_tests.yml/badge.svg)
![Unit Tests](https://github.com/sfoe/drill-frontend/actions/workflows/unit_tests.yml/badge.svg)
![Security](https://github.com/sfoe/drill-frontend/actions/workflows/security.yml/badge.svg)
![Accessibility](https://img.shields.io/badge/accessibility-100-brightgreen)
![Best Practices](https://img.shields.io/badge/best%20practices-92-green)
![SEO](https://img.shields.io/badge/SEO-92-green)


# drill-frontend

Vue.js application with a mapping component to provide information on the possibilities of installing geothermal probes in Switzerland, using the cantons' geoservices.

This application supports languages DE, FR, IT, EN. You can select default using query string `?lang=IT`


## Project Setup

### Backend

ℹ️ This Vue.js app needs a backend to work.

The backend is published here, please follow instructions: [https://github.com/SFOE/drillapi](https://github.com/SFOE/drillapi)

A docker image can also be pulled from https://github.com/SFOE/drillapi/pkgs/container/drillapi


### Install Vue.js dev environment

This project uses Node.js. Checkout official documentation in order to manage node versions correctly with Node Version Manager (NVM) at https://nodejs.org/en/download

```sh
git clone git@github.com:SFOE/drill-frontend.git
cd drill-frontend
npm ci
```

⚠️ Never use `npm install` — the project enforces `npm ci` via a preinstall guard script.


### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Upgrade packages

```sh
npx npm-check-updates -u
npm install --ignore-scripts
```

After upgrading, run `npm audit` to check for vulnerabilities. Known transitive vulnerabilities are pinned via `overrides` in `package.json`.


### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

Unit tests cover:
- **Store logic** — `mapStore` (property-based tests with fast-check), `languageStore`
- **Utilities** — `debounce`, `stripHtml`

### Run End-to-End Tests with [Cypress](https://www.cypress.io/)

Interactive mode (opens Cypress UI):

```sh
npm run test:e2e:dev
```

Headless mode (CI):

```sh
npm run test:e2e
```

E2E tests cover all components: Header, Footer, Map, Infobox (all suitability levels), Address Search, Language Switcher, and Static Elements.

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### Format with [Prettier](https://prettier.io/)

```sh
npm run format
```


## Architecture

```
src/
├── assets/          # CSS (design tokens in base.css), images, SVGs
├── components/      # Vue SFCs (Composition API + script setup)
├── composables/     # Reusable logic (useDevice, useProjections, useGeoAdmin)
├── locales/         # i18n translation files (de, en, fr, it)
├── router/          # Vue Router (single route)
├── stores/          # Pinia stores (mapStore, languageStore)
├── types/           # TypeScript interfaces
├── utils/           # Pure utility functions (debounce, stripHtml)
└── views/           # Page-level components
```

### CSS Design Tokens

Global design tokens (colors, radii, shadows) are defined as CSS custom properties in `src/assets/base.css`. Components reference these variables instead of hardcoded values:

```css
var(--color-primary)   /* #2f4356 */
var(--color-link)      /* #005ea5 */
var(--radius-md)       /* 8px */
var(--shadow-sm)       /* subtle box shadow */
```

### Security

- Content-Security-Policy meta tag in `index.html`
- `npm ci` enforced via preinstall guard (no `npm install`)
- `npm audit` runs in CI at `--audit-level=high`
- Dependency overrides pin known vulnerable transitive packages
- `stripHtml` uses DOMParser (XSS-safe) instead of innerHTML
- Address search input is debounced (300ms) to prevent API abuse


## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_BACKEND_URL` | Backend API base URL | `http://localhost:8000/` (dev), empty = relative (prod) |

Environment files: `.env.development`, `.env.production`


## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).
