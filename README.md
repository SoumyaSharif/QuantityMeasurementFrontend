# Quantity Measurement Frontend

A soft, minimal frontend web app for quantity conversion, comparison, and arithmetic operations across multiple unit types.

This project includes a login/signup screen and a dashboard for working with:
- Length
- Weight
- Temperature
- Volume

The app is currently fully frontend-based and uses `localStorage` for user sessions and calculation history.

## Features

- Login and signup UI
- Local browser-based authentication flow
- Unit conversion
- Unit comparison
- Arithmetic operations between compatible units
- Recent calculation history panel
- Soft, minimal responsive UI

## Tech Stack

- HTML
- CSS
- JavaScript
- `localStorage` for temporary data persistence

## Project Structure

```text
Quantity_Measurement_Frontend/
├── index.html
├── README.md
├── css/
│   ├── auth.css
│   └── dashboard.css
├── js/
│   ├── auth.js
│   └── dashboard.js
└── pages/
    └── dashboard.html
```

## How It Works

### Authentication

- Users can sign up and log in from the landing page.
- User details are stored in the browser using `localStorage`.
- After login, the user is redirected to the dashboard.
- Session data is checked before opening the dashboard.

### Dashboard

The dashboard allows the user to:
- Select a measurement type
- Choose an action: comparison, conversion, or arithmetic
- Enter values and units
- View the result instantly
- Save recent calculations in local history

## How To Run

This is a static frontend project, so no build step is required.

### Option 1

Open [index.html](/c:/Users/soumy/OneDrive/Desktop/Quantity_Measurement_Frontend/index.html) directly in your browser.

### Option 2

Run it using a local live server from your code editor for a smoother development workflow.

## Important Note

This project is not connected to a backend.

- No database is used
- No real authentication server is used
- User accounts and session data are stored only in the current browser
- Clearing browser storage will remove saved users, session state, and history

## Main Files

- [index.html](/c:/Users/soumy/OneDrive/Desktop/Quantity_Measurement_Frontend/index.html): Login and signup page
- [pages/dashboard.html](/c:/Users/soumy/OneDrive/Desktop/Quantity_Measurement_Frontend/pages/dashboard.html): Main dashboard page
- [js/auth.js](/c:/Users/soumy/OneDrive/Desktop/Quantity_Measurement_Frontend/js/auth.js): Authentication and session logic
- [js/dashboard.js](/c:/Users/soumy/OneDrive/Desktop/Quantity_Measurement_Frontend/js/dashboard.js): Calculator and dashboard functionality
- [css/auth.css](/c:/Users/soumy/OneDrive/Desktop/Quantity_Measurement_Frontend/css/auth.css): Auth page styling
- [css/dashboard.css](/c:/Users/soumy/OneDrive/Desktop/Quantity_Measurement_Frontend/css/dashboard.css): Dashboard styling

## Future Improvements

- Connect to a backend for real authentication
- Store user data securely
- Add more unit categories
- Add dark mode or theme switching
- Improve form validation and error handling
- Add export or saved history features

## Author

Built for the Quantity Measurement frontend project.
