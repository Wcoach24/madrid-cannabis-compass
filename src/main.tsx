import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles/fonts.css";
import "./index.css";

// Signal first paint completion for progressive enhancement
requestAnimationFrame(() => {
  document.documentElement.classList.add("hydration-ready");
});

createRoot(document.getElementById("root")!).render(<App />);
