import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles/fonts.css";
import "./index.css";

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
