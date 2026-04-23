# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - External Geoservice Failure Produces Generic Application Error
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior — it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Setup**: Install `fast-check` as a dev dependency (`npm install -D fast-check`). Create test file at `src/stores/__tests__/mapStore.test.ts`
  - **Scoped PBT Approach**: For this deterministic bug, scope the property to concrete failing cases — mock the backend to return HTTP 502 (simulating geoservice timeout/connection error) for any canton
  - Property: _for all_ canton in {"BE", "ZH", "VD", "AG", ...} and valid Swiss coordinates, when the external geoservice fails (backend returns 502), `fetchGroundCategory` should set `groundCategory.harmonized_value` to 98 (not 99) and `selectedCanton` to the canton identifier
  - Mock `axios.get` to reject with a 502 status (simulating current backend behavior on geoservice failure)
  - Assert: `mapStore.groundCategory?.harmonized_value === 98` (expected behavior from design)
  - Assert: `mapStore.selectedCanton !== null` (canton identifier preserved)
  - Assert: `mapStore.groundCategoryError === true`
  - Run test on UNFIXED code with `npx vitest --run src/stores/__tests__/mapStore.test.ts`
  - **EXPECTED OUTCOME**: Test FAILS because unfixed code sets `harmonized_value = 99` and `selectedCanton = null` in the catch block — this confirms the bug exists
  - Document counterexamples found (e.g., "fetchGroundCategory(2600000, 1200000) sets harmonized_value=99 instead of 98, selectedCanton=null instead of canton identifier")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Geoservice-Failure Behavior Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - **Setup**: Add preservation tests in the same test file `src/stores/__tests__/mapStore.test.ts`
  - Observe on UNFIXED code: mock `axios.get` to return successful responses with various `harmonized_value` codes and verify store state
  - Observe: for `harmonized_value` in {1, 2, 3, 4, 5}, store sets `wmsConfig` from `data.canton_config`, `groundCategory` from `data.ground_category`, `groundCategoryError = false`, `selectedCanton` from `data.canton`, and coordinates
  - Observe: for `harmonized_value = 6` (not in Switzerland), store sets `wmsConfig = null`, `selectedCanton = null`, `groundCategoryError = true`, and coordinates
  - Observe: for genuine network errors (axios throws with no response / timeout between frontend and backend), store sets `harmonized_value = 99`, `source_values = 'server error'`, `wmsConfig = null`, `selectedCanton = null`, `groundCategoryError = true`
  - Write property-based test using `fast-check`: _for all_ `harmonized_value` in `fc.constantFrom(1, 2, 3, 4, 5)` and arbitrary canton string and valid coordinates, the store state matches the observed behavior (wmsConfig set, groundCategoryError false, selectedCanton set)
  - Write property-based test: _for all_ `harmonized_value = 6` with arbitrary coordinates, store clears wmsConfig and selectedCanton
  - Write property-based test: _for all_ network errors (frontend-to-backend failures), store produces `harmonized_value = 99` fallback
  - Run tests on UNFIXED code with `npx vitest --run src/stores/__tests__/mapStore.test.ts`
  - **EXPECTED OUTCOME**: Tests PASS — this confirms baseline behavior to preserve
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Fix for external geoservice error handling

  - [x] 3.1 Backend: Catch external geoservice exceptions and return structured response
    - In the backend geoservice layer (`c:\projects\drillapi`), wrap calls to external cantonal WMS/ESRI REST services in try/except blocks
    - Catch network errors (timeouts, connection errors, invalid responses) from external geoservice calls
    - Instead of raising `HTTPException(502)`, return a structured HTTP 200 response with `harmonized_value = 98` and the canton identifier
    - Ensure genuine internal errors (unhandled exceptions, configuration errors) continue to raise appropriate HTTP exceptions
    - _Bug_Condition: isBugCondition(input) where geoserviceResponse.isTimeout OR isConnectionError OR isInvalidResponse OR isServiceUnavailable_
    - _Expected_Behavior: Return HTTP 200 with harmonized_value=98 and canton identifier instead of HTTPException(502)_
    - _Preservation: Non-geoservice backend errors continue to raise HTTP exceptions as before_
    - _Requirements: 2.1, 2.3, 3.5_

  - [x] 3.2 Frontend: Handle new `harmonized_value = 98` in `fetchGroundCategory` success path
    - In `src/stores/mapStore.ts`, add a condition in the success response handler (alongside the existing `harmonized_value === 6` check) for `harmonized_value === 98`
    - When `harmonized_value === 98`: set `groundCategoryError = true`, set `groundCategory` from response, set `selectedCanton` from `data.canton` (preserving canton identifier), set coordinates, and set `wmsConfig = null`
    - Keep the catch block unchanged — it continues to handle genuine HTTP errors with `harmonized_value = 99`
    - _Bug_Condition: Backend now returns HTTP 200 with harmonized_value=98 for geoservice failures_
    - _Expected_Behavior: Store sets groundCategoryError=true, preserves selectedCanton from response, sets coordinates_
    - _Preservation: Catch block unchanged, harmonized_value 1-6 handling unchanged_
    - _Requirements: 2.2, 3.1, 3.2, 3.3, 3.4_

  - [x] 3.3 Frontend: Add visual mapping for `harmonized_value = 98` in InfoboxComponent
    - In `src/components/InfoboxComponent.vue`, add entry `98: { color: 'orange', icon: IconOrange }` to the `mapping` object in the `suitabilityInfo` computed property
    - This gives the geoservice-failure message a distinct visual treatment (orange) from the purple "application error" style (99)
    - _Expected_Behavior: harmonized_value=98 renders with orange color and exclamation icon_
    - _Preservation: All existing mapping entries (1-6, 99) unchanged_
    - _Requirements: 2.2_

  - [x] 3.4 Frontend: Add i18n messages for `harmonized_value = 98` in all locale files
    - Add `suitability_level_98` and `suitability_level_98_short` keys to all four locale files (`de.json`, `en.json`, `fr.json`, `it.json`)
    - EN short: "Cantonal geoportal temporarily unavailable"
    - EN body: "The geoportal of the selected canton is temporarily unavailable. Please try again later. This does not indicate an error in the application."
    - DE short: "Kantonales Geoportal vorübergehend nicht verfügbar"
    - DE body: "Das Geoportal des ausgewählten Kantons ist vorübergehend nicht verfügbar. Bitte versuchen Sie es später erneut. Dies ist kein Fehler der Anwendung."
    - FR short: "Géoportail cantonal temporairement indisponible"
    - FR body: "Le géoportail du canton sélectionné est temporairement indisponible. Veuillez réessayer plus tard. Il ne s'agit pas d'une erreur de l'application."
    - IT short: "Geoportale cantonale temporaneamente non disponibile"
    - IT body: "Il geoportale del Cantone selezionato è temporaneamente non disponibile. Si prega di riprovare più tardi. Non si tratta di un errore dell'applicazione."
    - _Expected_Behavior: i18n keys resolve to canton-aware messages distinguishing geoservice failure from application error_
    - _Preservation: Existing suitability_level_99 and all other i18n keys unchanged_
    - _Requirements: 2.2_

  - [x] 3.5 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - External Geoservice Failure Returns Structured Response
    - **IMPORTANT**: Re-run the SAME test from task 1 — do NOT write a new test
    - The test from task 1 encodes the expected behavior (harmonized_value=98, selectedCanton preserved)
    - Update the test mock to simulate the NEW backend behavior: `axios.get` returns HTTP 200 with `{ ground_category: { harmonized_value: 98, ... }, canton: 'BE', canton_config: null }`
    - Run bug condition exploration test from step 1 with `npx vitest --run src/stores/__tests__/mapStore.test.ts`
    - **EXPECTED OUTCOME**: Test PASSES — confirms the bug is fixed and expected behavior is satisfied
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.6 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Geoservice-Failure Behavior Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run preservation property tests from step 2 with `npx vitest --run src/stores/__tests__/mapStore.test.ts`
    - **EXPECTED OUTCOME**: Tests PASS — confirms no regressions in existing behavior
    - Confirm all tests still pass after fix (no regressions)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4. Checkpoint - Ensure all tests pass
  - Run full test suite: `npx vitest --run` in `drill-frontend/`
  - Run type check: `npm run type-check` in `drill-frontend/`
  - Run lint: `npm run lint` in `drill-frontend/`
  - Verify backend tests pass in `c:\projects\drillapi` (if test suite exists)
  - Ensure all tests pass, ask the user if questions arise
