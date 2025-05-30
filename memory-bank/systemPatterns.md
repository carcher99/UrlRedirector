# System Patterns: URL Redirector

## Architecture
The application will follow a client-server architecture.
- **Server:** Node.js with Express.js to handle HTTP requests, manage redirection data, and serve the frontend files.
- **Client:** A simple HTML, CSS, and JavaScript frontend for the configuration interface, running in a web browser.

## Key Technical Decisions
- **Backend Framework:** Express.js for its minimalist and flexible nature.
- **Frontend:** Vanilla JavaScript, HTML, and CSS for simplicity and to avoid the overhead of a frontend framework in this initial phase.
- **Data Storage:** Initially, a JSON file will be used for storing redirection mappings. This can be upgraded to a database later if needed.
- **Redirection Mechanism:** HTTP 302 (Found) redirects will be used to allow for potential future updates to destination URLs.

## Component Relationships
- The frontend will make API calls to the backend to fetch, add, edit, and delete redirection entries.
- The backend will read from and write to the JSON data file to persist the redirection mappings.
- The backend will intercept incoming requests to the `/to/:acronym` path and perform the redirection based on the data in the JSON file.
