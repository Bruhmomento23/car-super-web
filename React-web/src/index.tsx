import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { StyledEngineProvider } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom'; // <--- Add this import
import App from './App';


// 1. index.tsx (The Entry Point)
// This is the very first file the browser runs. Its only job is to connect your React code to the actual website.
// 	• What it does: It finds a single empty <div> in your index.html (usually with the ID "root") and says: "Hey React, take control of this space!"
// 	• The "Wrappers": This is where you put "Global" settings that the whole app needs to know about.
// 		○ BrowserRouter: Tells the app, "Listen to the URL bar in the browser so we can change pages."
// 		○ StrictMode: A tool that helps developers find bugs early.
// 		○ StyledEngineProvider: Tells your styling (MUI) how to behave.
// Analogy: index.tsx is like the main power switch for your house. If it's not on, nothing else works.


ReactDOM.createRoot(document.querySelector("#root")!).render(
  <React.StrictMode>
    <StyledEngineProvider injectFirst>
      <BrowserRouter> {/* <--- Wrap your App in this */}
        <App />
      </BrowserRouter>
    </StyledEngineProvider>
  </React.StrictMode>
);