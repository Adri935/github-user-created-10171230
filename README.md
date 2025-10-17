# GitHub User Creation Date Fetcher

This web application fetches a GitHub user's account creation date and displays it in YYYY-MM-DD UTC format. The application uses the GitHub API and supports optional authentication via a token parameter.

## Setup

1. Save all files (`index.html`, `style.css`, `script.js`) in the same directory
2. Open `index.html` in a web browser
3. Enter a GitHub username in the form

## Usage

1. Enter a valid GitHub username in the input field
2. Optionally provide a `?token=` parameter in the URL for authenticated requests
3. Submit the form to fetch and display the account creation date

## Code Explanation

- **HTML**: Uses semantic Bootstrap form with proper accessibility attributes
- **CSS**: Responsive styling with visual feedback for loading and error states
- **JavaScript**: Implements async/await for API requests, proper error handling, and date formatting

## License

MIT