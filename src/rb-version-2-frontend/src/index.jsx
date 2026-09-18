import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import "./gemfind-scope.css";
import "./global.css";
import "./video-tryon-overrides.css";
import "./portal-alert-overrides.css";

function resolveMountEl() {
  return (
    document.getElementById("gemfindrb-root") ||
    document.getElementById("root")
  );
}

function resolveBasename() {
  const cfg = typeof window !== "undefined" ? window.gemfindRBConfig : null;
  if (cfg && cfg.routerBasename) {
    return cfg.routerBasename;
  }
  if (window.location.hostname === "localhost") {
    return "";
  }
  return "/ringbuilder";
}

function injectShopDomain() {
  const mount = resolveMountEl();
  const shop =
    mount?.dataset?.shop ||
    (typeof window !== "undefined" && window.gemfindRBConfig?.shop) ||
    window.location.hostname;

  if (!document.getElementById("shop_domain")) {
    const input = document.createElement("input");
    input.setAttribute("type", "hidden");
    input.setAttribute("id", "shop_domain");
    input.setAttribute("value", shop);
    document.body.appendChild(input);
  }
}

function bootRingBuilder() {
  const container = resolveMountEl();
  if (!container) {
    console.error("GemFind Ring Builder: mount element #gemfindrb-root not found.");
    return;
  }
  injectShopDomain();
  const root = createRoot(container);
  const baseurl = resolveBasename();

  root.render(
    <BrowserRouter basename={baseurl}>
      <App />
    </BrowserRouter>
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootRingBuilder);
} else {
  bootRingBuilder();
}

reportWebVitals();
