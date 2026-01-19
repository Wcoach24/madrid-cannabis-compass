import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles/fonts.css";
import "./index.css";

const root = createRoot(document.getElementById("root")!);
root.render(<App />);

// Signal hydration complete AFTER React has committed AND painted
// Triple-rAF ensures: 1) React commits, 2) Layout calculated, 3) Browser painted
// This triggers CSS to hide the static hero shell via: html.hydration-ready #hero-shell { display: none; }
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.documentElement.classList.add("hydration-ready");
    });
  });
});
