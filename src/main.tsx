import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { TooltipProvider } from "@/components/ui/tooltip";
import { initScrollReveal } from "./lib/scrollReveal";
import "@fontsource-variable/geist-mono";
import "@fontsource-variable/oxanium";
import "./index.css";

function RootApp() {
  React.useEffect(() => {
    const cleanup = initScrollReveal();
    return cleanup;
  }, []);

  return <App />;
}

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <TooltipProvider>
      <RootApp />
    </TooltipProvider>
  </React.StrictMode>,
);
