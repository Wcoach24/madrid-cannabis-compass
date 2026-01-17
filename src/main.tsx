import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles/fonts.css";
import "./index.css";

const root = createRoot(document.getElementById("root")!);
root.render(<App />);

// Signal hydration complete AFTER React has committed to DOM
// Using double-rAF to ensure we're after the paint
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    document.documentElement.classList.add("hydration-ready");
  });
});
