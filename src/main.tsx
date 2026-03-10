import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles/fonts.css";
import "./index.css";

const root = createRoot(document.getElementById("root")!);
root.render(<App />);

// Signal hydration complete AFTER React has committed
// Single rAF is sufficient - React has already committed at this point
requestAnimationFrame(() => {
  // Add hydration-ready class for CSS transitions (backdrop-blur, glass effects)
  document.documentElement.classList.add("hydration-ready");
  
  // Remove hero-shell from DOM entirely after React renders.
  // The shell exists in index.html OUTSIDE #root for homepage LCP optimization,
  // but it contains a hardcoded homepage H1 that causes duplicate H1 issues
  // on every non-homepage route. CSS hiding (html.hydration-ready #hero-shell)
  // has a race condition with lazy-loaded components, so DOM removal is safer.
  const heroShell = document.getElementById("hero-shell");
  if (heroShell) {
    heroShell.remove();
  }
});
