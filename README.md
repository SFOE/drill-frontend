![Lint](https://github.com/sfoe/drill-frontend/actions/workflows/lint.yml/badge.svg)
![Tests](https://github.com/sfoe/drill-frontend/actions/workflows/e2e_tests.yml/badge.svg)
![Unit Tests](https://github.com/sfoe/drill-frontend/actions/workflows/unit_tests.yml/badge.svg)
![Coverage](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/sfoe/drill-frontend/main/badges/coverage.json)
![Security](https://github.com/sfoe/drill-frontend/actions/workflows/security.yml/badge.svg)
![Accessibility](https://img.shields.io/badge/Accessibility-100-brightgreen?logo=lighthouse&logoColor=white)
![Best Practices](https://img.shields.io/badge/Best%20Practices-92-brightgreen?logo=lighthouse&logoColor=white)
![SEO](https://img.shields.io/badge/SEO-92-brightgreen?logo=lighthouse&logoColor=white)


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

Run with coverage report:

```sh
npx vitest --run --coverage
```

#### Unit test structure

Tests live in `__tests__/` folders colocated with their source:

```
src/
├── __tests__/
│   └── i18n.test.ts                                     # setLocale lazy loading, title/meta side effects
├── components/__tests__/
│   ├── AddressFulltextSearchComponent.test.ts           # Rendering, debounce, ARIA, selection
│   ├── AddressFulltextSearchComponent.branches.test.ts  # Keyboard nav, Enter, request abort/cancel, errors
│   ├── App.test.ts                                      # Router-view outlet
│   ├── FooterComponent.test.ts                          # Links, mailto, copyright year
│   ├── HeaderComponent.test.ts                          # Logo, title, embedded language switcher
│   ├── InfoboxComponent.test.ts                         # Color mapping, loading state, layout
│   ├── InfoboxLinksComponent.test.ts                    # Link rendering, security attrs
│   ├── LanguageSwitcherComponent.test.ts                # Locale options, store binding
│   ├── LoadingSpinner.test.ts                           # Basic rendering
│   ├── MapComponent.test.ts                             # Legend toggle, WMS-layer watcher, map-click geocoding
│   └── StaticElementsComponent.test.ts                  # Info block headings, external links
├── composables/__tests__/
│   ├── useDevice.test.ts                                # Mobile detection, resize handling
│   ├── useGeoadminReverseGeocoding.test.ts              # Address formatting, edge cases
│   └── useProjections.test.ts                           # LV95 / LV03 proj4 definitions
├── router/__tests__/
│   └── index.test.ts                                   # Route registration, history mode
├── stores/__tests__/
│   ├── languageStore.test.ts                            # Locale persistence
│   ├── mapStore.test.ts                                 # fetchGroundCategory, clearSearchState, getters
│   └── searchStore.test.ts                              # State management, clearSearchState
├── utils/__tests__/
│   ├── debounce.test.ts                                 # Timer behavior, argument passing
│   └── stripHtml.test.ts                                # Tag removal, XSS safety, property-based
└── views/__tests__/
    └── DrillVue.test.ts                                 # ?lang= query handling, layout composition
```

Current coverage: **statements 93%, branches 85%, functions 91%, lines 94%**. The coverage badge above is regenerated automatically on every push to `main` by the unit-tests workflow.

#### Testing patterns used

- **Property-based testing** (`fast-check`) — `mapStore` tests all 26 Swiss cantons × valid LV95 coordinate ranges; `stripHtml` verifies invariants (idempotency, no tags in output) against random input.
- **Component testing** (`@vue/test-utils` + `@pinia/testing`) — shallow rendering with mocked stores to test rendering logic and user interactions.
- **Composable testing** — pure function tests with mocked HTTP layer for `useGeoAdmin`; lifecycle-aware tests via wrapper components for `useDevice`.

### Run End-to-End Tests with [Cypress](https://www.cypress.io/)

Interactive mode (opens Cypress UI):

```sh
npm run test:e2e:dev
```

Headless mode (CI):

```sh
npm run test:e2e
```

#### E2E test structure

```
cypress/e2e/
├── AddressFultextSearchComponent.cy.ts   # Search input, dropdown display, clearing
├── FooterComponent.cy.ts                 # Footer layout, links, copyright year
├── HeaderComponent.cy.ts                 # Logo, header visibility
├── InfoboxComponent.cy.ts                # All harmonized_value colors, mobile expand/collapse
├── LanguageSwitcherComponent.cy.ts       # DE ↔ EN switching
├── MapComponent.cy.ts                    # Map rendering, click interaction
├── StaticElementsComponent.cy.ts         # Info block, canton info, external links
└── UserJourney.cy.ts                     # Integrated flows (see below)
```

#### UserJourney.cy.ts — integrated regression tests

This file covers the scenarios most likely to break during refactoring:

- **Search → select → infobox** — full primary user flow
- **Clear button** — resets infobox and input after selection
- **Backend error (500)** — shows purple error infobox
- **Geoservice unavailable (98)** — preserves canton name in error message
- **Loading spinner** — visible during fetch, disappears after
- **Keyboard navigation** — ArrowDown/Up, Escape, Enter
- **URL query parameter** — `?lang=fr` / `?lang=it` loads correct locale
- **Click outside** — closes dropdown

#### E2E test utilities

- `cypress/support/mock-backend.ts` — provides `mockDrillCategoryApi()` and `mockDrillCategoryError()` helpers with predefined responses for all `harmonized_value` states (1-6, 98, 99).

### CI

Both test suites run automatically on every PR and push to `main` via GitHub Actions:

| Workflow | File | What it runs |
|----------|------|--------------|
| Unit tests & type check | `.github/workflows/unit_tests.yml` | `vue-tsc` → `vitest --coverage` → `eslint` |
| E2E tests | `.github/workflows/e2e_tests.yml` | Builds app → starts preview → `cypress run` |

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
- `audit-ci` runs in CI (`security.yml`) against `audit-ci.jsonc`, failing on high/critical advisories while allowlisting specific reviewed ones
- Amazon Inspector scans the repository on release (`release_and_push_s3.yml`); reviewed, non-shipped findings are allowlisted in `.inspector-ignore`
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
