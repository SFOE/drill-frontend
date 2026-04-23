# Bugfix Requirements Document

## Introduction

When cantonal geoservices (external WMS/ESRI REST services) are unavailable or return errors, the application displays a misleading "Application error" message (`harmonized_value = 99`) to users. This makes users believe the application itself is broken, when in reality an external cantonal geoservice is temporarily unavailable — something the application has no control over. The fix must introduce a new dedicated `harmonized_value` code for external geoservice failures on the backend (returning a structured success response with this code instead of raising an HTTP exception), and the frontend must handle this new code with a user-friendly message that clearly communicates the nature of the issue and identifies the affected canton. The existing "Application error" message (`harmonized_value = 99`) must be preserved for genuine internal errors only.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN an external cantonal geoservice is unavailable or returns an error THEN the backend raises an `HTTPException(502)` instead of returning a structured response with a dedicated error code, forcing the frontend to handle it as an uncaught exception

1.2 WHEN the frontend catches the HTTP 502 error from the backend THEN it sets `harmonized_value = 99` with `source_values = 'server error'`, displaying the title "Anwendungsfehler" / "Application error" and the message "Versuchen Sie es erneut oder kontaktieren Sie uns..." / "Please try again or contact us..." — with no mention of which cantonal geoportal is affected

1.3 WHEN the backend encounters a network timeout or invalid response from an external cantonal geoservice THEN it raises the same HTTP 502 exception as for other gateway errors, providing no structured way for the frontend to distinguish external service failures from internal application errors

### Expected Behavior (Correct)

2.1 WHEN an external cantonal geoservice is unavailable, times out, or returns an invalid response THEN the backend SHALL return a structured success response (HTTP 200) containing a new dedicated `harmonized_value` code (distinct from 99) that specifically indicates an external geoservice failure, along with the canton identifier

2.2 WHEN the frontend receives a response with the new external-geoservice-failure `harmonized_value` code THEN the system SHALL display a distinct message indicating that the specific canton's geoportal is temporarily unavailable, clearly communicating that the application itself is working correctly, and suggesting the user try again later

2.3 WHEN the backend encounters an external cantonal geoservice failure THEN it SHALL NOT raise an HTTP exception for this case, but instead handle it as a known, expected condition and return a proper structured response

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a genuine internal application error occurs (e.g., unhandled exception in backend logic, frontend JavaScript error, or network failure between frontend and backend) THEN the system SHALL CONTINUE TO display `harmonized_value = 99` with the "Application error" message

3.2 WHEN the backend successfully returns ground category data with `harmonized_value` of 1, 2, 3, 4, 5, or 6 THEN the system SHALL CONTINUE TO display the corresponding suitability message and behave exactly as before

3.3 WHEN the backend returns `harmonized_value = 6` (coordinates not in Switzerland) THEN the system SHALL CONTINUE TO clear the WMS config, set the canton to null, and display the "not in Switzerland" message

3.4 WHEN the backend returns a successful response with any valid `harmonized_value` THEN the system SHALL CONTINUE TO set the WMS config, ground category, selected canton, and coordinates as before

3.5 WHEN the backend encounters errors unrelated to external cantonal geoservices THEN the backend SHALL CONTINUE TO raise appropriate HTTP exceptions as before
