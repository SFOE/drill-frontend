# Geoservice Error Handling Bugfix Design

## Overview

When cantonal geoservices (external WMS/ESRI REST services) are unavailable or return errors, the application incorrectly displays a generic "Application error" message (`harmonized_value = 99`), misleading users into thinking the application itself is broken. The fix introduces a new dedicated `harmonized_value` code (e.g., `98`) on the backend to represent external geoservice failures, returned as a structured HTTP 200 response with the canton identifier. The frontend then handles this new code with a user-friendly message identifying the affected canton's geoportal as temporarily unavailable. The existing `harmonized_value = 99` is preserved exclusively for genuine internal application errors.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug — an external cantonal geoservice is unavailable, times out, or returns an invalid response, causing the backend to raise an `HTTPException(502)` instead of returning a structured response
- **Property (P)**: The desired behavior — the backend returns HTTP 200 with a new `harmonized_value` code (distinct from 99) and the canton identifier; the frontend displays a canton-specific "geoportal temporarily unavailable" message
- **Preservation**: Existing behavior that must remain unchanged — `harmonized_value = 99` for genuine internal errors, correct display of values 1–6, store state management for valid responses, and HTTP exceptions for non-geoservice backend errors
- **`fetchGroundCategory`**: The async function in `mapStore.ts` that calls the backend API at `v1/drill-category/{east}/{north}` and processes the response, including error handling in the `catch` block
- **`harmonized_value`**: An integer code in the backend response that maps to a suitability level (1–6), an error state (99), or the new external-geoservice-failure state (proposed: 98)
- **`InfoboxComponent`**: The Vue component that renders the suitability result using i18n keys derived from `harmonized_value` (e.g., `suitability_level_99_short`)
- **`CantonWmsConfig`**: The WMS configuration object for a canton, including geoportal URLs and layer definitions

## Bug Details

### Bug Condition

The bug manifests when an external cantonal geoservice (WMS or ESRI REST) is unavailable, times out, or returns an invalid response during a drill-category lookup. The backend raises an `HTTPException(502)`, which the frontend catches in the `catch` block of `fetchGroundCategory` and maps to `harmonized_value = 99` with `source_values = 'server error'`. This displays "Anwendungsfehler" / "Application error" — indistinguishable from a genuine internal application failure.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { east_coord: number, north_coord: number, canton: string }
  OUTPUT: boolean

  geoserviceResponse := callExternalGeoservice(input.canton, input.east_coord, input.north_coord)

  RETURN geoserviceResponse.isTimeout
         OR geoserviceResponse.isConnectionError
         OR geoserviceResponse.isInvalidResponse
         OR geoserviceResponse.isServiceUnavailable
END FUNCTION
```

### Examples

- **Timeout**: User queries coordinates in canton BE, the cantonal WMS service takes >10s to respond → backend raises `HTTPException(502)` → frontend shows "Application error" instead of "Canton BE geoportal temporarily unavailable"
- **Connection refused**: User queries coordinates in canton ZH, the cantonal ESRI REST service is down → backend raises `HTTPException(502)` → frontend shows "Application error" instead of identifying ZH's geoportal as the issue
- **Invalid response**: User queries coordinates in canton VD, the cantonal service returns malformed XML → backend raises `HTTPException(502)` → frontend shows generic error instead of canton-specific message
- **Edge case — partial failure**: If a canton has multiple layers and one layer's service fails, the entire request currently fails with the same generic error

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Valid suitability responses with `harmonized_value` 1, 2, 3, 4, 5, or 6 must continue to display the corresponding suitability message, set WMS config, ground category, selected canton, and coordinates
- `harmonized_value = 6` (not in Switzerland) must continue to clear WMS config, set canton to null, and display the "not in Switzerland" message
- `harmonized_value = 99` must continue to be used for genuine internal application errors (unhandled exceptions, frontend JS errors, network failures between frontend and backend)
- Mouse/touch interactions, address search, map rendering, and all other UI behaviors must remain unchanged
- Backend errors unrelated to external cantonal geoservices must continue to raise appropriate HTTP exceptions

**Scope:**
All inputs where the external cantonal geoservice responds successfully (whether the suitability is positive, negative, or unknown) should be completely unaffected by this fix. This includes:
- Successful geoservice queries returning any valid suitability level
- Coordinates outside Switzerland (handled before geoservice call)
- Cantons that don't provide geoservice data (handled with `harmonized_value = 5`)
- Frontend-to-backend network failures (still caught as `harmonized_value = 99`)

## Hypothesized Root Cause

Based on the bug description and code analysis, the root cause is:

1. **Backend lacks structured error handling for external geoservice failures**: The geoservice layer raises an `HTTPException(502)` when an external cantonal service is unavailable, treating it the same as an internal gateway error. There is no dedicated response code or structured payload to distinguish external service failures from internal errors.

2. **Frontend catch block is a blanket fallback**: In `mapStore.ts`, the `catch` block of `fetchGroundCategory` treats all HTTP errors identically — it creates a fallback `GroundCategory` with `harmonized_value = 99` and `source_values = 'server error'`. There is no logic to differentiate between a 502 from an external geoservice failure and other error types.

3. **No canton identifier in error path**: When the backend raises an exception for a geoservice failure, the canton identifier is lost. The frontend has no way to tell the user which canton's geoportal is affected, even if it could distinguish the error type.

4. **i18n messages lack a geoservice-failure entry**: The locale files only define messages for `suitability_level_99` (generic application error). There is no message key for an external geoservice failure that could include the canton name.

## Correctness Properties

Property 1: Bug Condition - External Geoservice Failure Returns Structured Response

_For any_ request where the external cantonal geoservice is unavailable, times out, or returns an invalid response (isBugCondition returns true), the backend SHALL return an HTTP 200 response with a new dedicated `harmonized_value` code (distinct from 99) and the canton identifier, and the frontend SHALL display a user-friendly message identifying the affected canton's geoportal as temporarily unavailable.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation - Non-Geoservice-Failure Behavior Unchanged

_For any_ input where the external cantonal geoservice responds successfully or the error is not a geoservice failure (isBugCondition returns false), the system SHALL produce the same behavior as the original code — valid suitability levels display correctly, `harmonized_value = 99` is used for genuine internal errors, and store state is managed identically.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: Backend geoservice layer (`drillapi/app/geoservices/`)

**Specific Changes**:
1. **Catch external geoservice exceptions**: Wrap calls to external cantonal WMS/ESRI REST services in try/except blocks that catch network errors (timeouts, connection errors, invalid responses) separately from internal errors
2. **Return structured response instead of raising HTTPException**: When an external geoservice fails, return a normal response (HTTP 200) with `harmonized_value = 98` (or another dedicated code) and include the canton identifier in the response payload
3. **Preserve HTTPException for internal errors**: Ensure that genuine internal errors (unhandled exceptions, configuration errors, etc.) continue to raise appropriate HTTP exceptions

**File**: Backend response models (`drillapi/app/models/`)

**Specific Changes**:
4. **Document the new harmonized_value code**: Add `98` (or chosen code) to the response model documentation as "external geoservice unavailable"

**File**: `drill-frontend/src/stores/mapStore.ts`

**Specific Changes**:
5. **Handle new harmonized_value in the success path**: In `fetchGroundCategory`, add a condition in the success response handler (alongside the existing `harmonized_value === 6` check) to handle the new code — set `groundCategoryError = true`, preserve the canton identifier from the response, and set coordinates
6. **Keep catch block unchanged**: The catch block should continue to handle genuine HTTP errors (network failures, 500s) with `harmonized_value = 99`

**File**: `drill-frontend/src/components/InfoboxComponent.vue`

**Specific Changes**:
7. **Add visual mapping for new code**: Add an entry in the `mapping` object for the new `harmonized_value` code (e.g., `98: { color: 'orange', icon: IconOrange }`) to give it a distinct visual treatment from the purple "application error" style

**File**: `drill-frontend/src/locales/{de,en,fr,it}.json`

**Specific Changes**:
8. **Add i18n messages for the new code**: Add `suitability_level_98` and `suitability_level_98_short` keys in all four locale files with canton-aware messages, e.g.:
   - EN short: "Cantonal geoportal temporarily unavailable"
   - EN body: "The geoportal of canton {canton} is temporarily unavailable. Please try again later. This does not indicate an error in the application."
   - DE short: "Kantonales Geoportal vorübergehend nicht verfügbar"
   - FR short: "Géoportail cantonal temporairement indisponible"
   - IT short: "Geoportale cantonale temporaneamente non disponibile"

**File**: `drill-frontend/src/stores/mapStore.ts` (GroundCategory interface)

**Specific Changes**:
9. **Ensure canton is available for display**: The `GroundCategory` interface or the store state must carry the canton identifier so the InfoboxComponent can include it in the displayed message. The backend response already includes `canton` at the top level of the response (`data.canton`), so the frontend can use `mapStore.selectedCanton` in the i18n interpolation.

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that simulate external geoservice failures (mocking HTTP calls to cantonal services) and verify the backend response and frontend rendering. Run these tests on the UNFIXED code to observe failures and understand the root cause.

**Test Cases**:
1. **Backend timeout test**: Mock a cantonal WMS service timeout and verify the backend response — expect `HTTPException(502)` on unfixed code (will fail to return structured response)
2. **Backend connection error test**: Mock a connection refused error from a cantonal service — expect `HTTPException(502)` on unfixed code
3. **Frontend error display test**: Set up mapStore with a 502 error response and verify InfoboxComponent renders "Application error" instead of a canton-specific message (will show wrong message on unfixed code)
4. **Canton identifier loss test**: Trigger a geoservice failure and verify the canton identifier is not available in the error response (will confirm canton info is lost on unfixed code)

**Expected Counterexamples**:
- Backend raises `HTTPException(502)` instead of returning structured response with dedicated code
- Frontend catch block creates fallback with `harmonized_value = 99`, losing canton context
- Possible causes: no try/except around geoservice calls, no dedicated error code, no i18n messages for geoservice failures

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  backendResponse := callDrillCategoryEndpoint(input.east_coord, input.north_coord)
  ASSERT backendResponse.status_code == 200
  ASSERT backendResponse.ground_category.harmonized_value == 98
  ASSERT backendResponse.canton IS NOT NULL

  frontendState := processResponse(backendResponse)
  ASSERT frontendState.groundCategoryError == true
  ASSERT frontendState.selectedCanton == input.canton
  ASSERT displayedMessage CONTAINS cantonName(input.canton)
  ASSERT displayedMessage != "Application error"
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT fetchGroundCategory_original(input) == fetchGroundCategory_fixed(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain (random coordinates, random valid harmonized_values)
- It catches edge cases that manual unit tests might miss (boundary coordinates, unusual canton configurations)
- It provides strong guarantees that behavior is unchanged for all non-geoservice-failure inputs

**Test Plan**: Observe behavior on UNFIXED code first for successful geoservice responses and genuine internal errors, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Valid suitability preservation**: For random coordinates that return `harmonized_value` in {1,2,3,4,5,6}, verify the store state (wmsConfig, groundCategory, selectedCanton, coordinates) is set identically before and after the fix
2. **Internal error preservation**: For genuine internal errors (mocked 500 responses), verify `harmonized_value = 99` is still produced with the same fallback behavior
3. **Not-in-Switzerland preservation**: For coordinates outside Switzerland, verify `harmonized_value = 6` handling (clear WMS, null canton) is unchanged
4. **Frontend-backend network failure preservation**: For axios network errors (no response from backend), verify the catch block still produces `harmonized_value = 99`

### Unit Tests

- Test backend geoservice error handling: verify structured response for timeout, connection error, invalid response
- Test backend preservation: verify HTTPException still raised for internal errors
- Test frontend `fetchGroundCategory` with new `harmonized_value = 98` response: verify store state
- Test frontend `fetchGroundCategory` with existing `harmonized_value` values: verify unchanged behavior
- Test InfoboxComponent rendering for new code: verify correct i18n message and visual style
- Test i18n interpolation: verify canton name appears in the displayed message

### Property-Based Tests

- Generate random geoservice failure types (timeout, connection error, invalid response) across random cantons and verify the backend always returns HTTP 200 with `harmonized_value = 98` and the correct canton
- Generate random valid backend responses with `harmonized_value` in {1,2,3,4,5,6} and verify the frontend store state is identical to the original behavior
- Generate random coordinates and mock successful geoservice responses to verify no regression in the happy path

### Integration Tests

- Test full flow: user clicks map in a canton with unavailable geoservice → backend returns structured error → frontend displays canton-specific message
- Test flow switching: user first gets a geoservice error for canton BE, then queries canton ZH successfully → verify state transitions correctly
- Test all four languages: verify the geoservice-unavailable message renders correctly in DE, EN, FR, IT with the canton name interpolated
