import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Apply theme from localStorage before render to prevent flash
const stored = localStorage.getItem('lifeos-tracker');
if (stored) {
  try {
    const parsed = JSON.parse(stored);
    const theme = parsed?.state?.theme || 'sakura-dark';
    document.documentElement.classList.add(`theme-${theme}`);
  } catch {
    document.documentElement.classList.add('theme-sakura-dark');
  }
} else {
  document.documentElement.classList.add('theme-sakura-dark');
}

createRoot(document.getElementById("root")!).render(<App />);
