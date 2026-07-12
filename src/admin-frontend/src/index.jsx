import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./wpdl-admin.css";
import "./gemfindrb-admin.css";
import "./gemfindrb-scope.css";

function mountAdmin() {
  const mount = document.getElementById("gemfindrb-admin-root");
  if (!mount) return;
  createRoot(mount).render(<App />);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountAdmin);
} else {
  mountAdmin();
}
