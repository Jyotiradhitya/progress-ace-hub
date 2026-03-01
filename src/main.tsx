import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Apply theme from localStorage before render
const stored = localStorage.getItem('lifeos-tracker');
if (stored) {
  try {
    const parsed = JSON.parse(stored);
    if (parsed?.state?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch {}
} else {
  // Default to dark
  document.documentElement.classList.add('dark');
}

createRoot(document.getElementById("root")!).render(<App />);
