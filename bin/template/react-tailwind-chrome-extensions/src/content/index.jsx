import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app";
import "./index.css";

if (typeof init === "undefined") {
  const init = () => {
    const app = document.createElement("div");
    app.id = "_tree_idea";
    document.body.appendChild(app);
    const container = document.getElementById("_tree_idea");
    createRoot(container).render(<App />);
  };

  init();
}
