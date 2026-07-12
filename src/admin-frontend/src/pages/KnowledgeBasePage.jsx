import React from "react";
import AdminShell from "../components/AdminShell";

export default function KnowledgeBasePage() {
  const cfg = window.gemfindRBAdminConfig || {};
  const toolUrl = cfg.frontendToolUrl || "/ringbuilder/";

  return (
    <AdminShell title="GemFind Ring Builder">
      <div className="gemfind-kb-box">
        <h2 style={{ marginTop: 0 }}>Getting started</h2>
        <ul>
          <li>Activation creates a <strong>Ring Builder</strong> page at <code>/ringbuilder/</code> with the full-width template and shortcode mount.</li>
          <li>Enter your JewelCloud dealer credentials under <strong>Settings → Account</strong>.</li>
          <li>Shoppers browse mountings at <code>/ringbuilder/settings/</code> and diamonds at <code>/ringbuilder/diamondlink/</code>.</li>
          <li>WooCommerce must be active for add-to-cart and checkout.</li>
        </ul>
        <p>
          <a className="gemfind-view-banner__btn" href={toolUrl} target="_blank" rel="noopener noreferrer">
            Open storefront
          </a>
        </p>
      </div>

      <div className="gemfind-kb-box" style={{ background: "#eaf6ff" }}>
        <h2 style={{ marginTop: 0 }}>Field reference</h2>
        <ul>
          <li><strong>Dealer ID</strong> — connects the builder to your JewelCloud inventory.</li>
          <li><strong>Sender email</strong> — address shoppers see on automated messages.</li>
          <li><strong>Store notification inbox</strong> — receives inquiry copies when enabled.</li>
          <li><strong>Theme colors</strong> — customize navigation, buttons, and backgrounds under CSS Configurator.</li>
          <li><strong>reCAPTCHA keys</strong> — protect public contact forms from spam.</li>
        </ul>
      </div>

      <div className="gemfind-kb-box">
        <h2 style={{ marginTop: 0 }}>Support</h2>
        <p>
          Questions about setup, JewelCloud credentials, or theme styling? Contact GemFind support at{" "}
          <a href="mailto:support@gemfind.com">support@gemfind.com</a> or visit{" "}
          <a href="https://gemfind.com/free-consultation/" target="_blank" rel="noopener noreferrer">
            gemfind.com/free-consultation
          </a>
          .
        </p>
      </div>
    </AdminShell>
  );
}
