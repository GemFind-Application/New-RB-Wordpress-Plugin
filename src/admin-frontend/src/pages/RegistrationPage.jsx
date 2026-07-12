import React, { useState } from "react";
import AdminToast from "../components/AdminToast";
import { apiPost } from "../api";
import { useAdminNotice } from "../hooks/useAdminNotice";

export default function RegistrationPage() {
  const cfg = window.gemfindRBAdminConfig || {};
  const { notice, showError } = useAdminNotice();
  const [shop] = useState(cfg.shop || "");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showError("Please enter your name and email.");
      return;
    }
    setLoading(true);
    try {
      await apiPost("/customer/register", {
        shop,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });
      window.location.reload();
    } catch (ex) {
      showError(String(ex.message || ex));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wpdl-admin-wrapper">
      <AdminToast notice={notice} />
      <div className="wpdl-registration-card">
        <h2 className="wpdl-registration-card__title">Welcome to Ring Builder</h2>
        <p className="wpdl-registration-card__lead">
          Register this site with GemFind so we can reach you about your account. You will only see this once.
        </p>
        <form className="wpdl-registration-form" onSubmit={onSubmit}>
          <label className="wpdl-registration-form__field">
            <span className="wpdl-registration-form__label">Store / site</span>
            <input type="text" value={shop} readOnly className="wpdl-registration-form__input wpdl-registration-form__input--readonly" />
          </label>
          <label className="wpdl-registration-form__field">
            <span className="wpdl-registration-form__label">
              Your name <span className="wpdl-registration-form__req">*</span>
            </span>
            <input
              type="text"
              className="wpdl-registration-form__input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </label>
          <label className="wpdl-registration-form__field">
            <span className="wpdl-registration-form__label">
              Email <span className="wpdl-registration-form__req">*</span>
            </span>
            <input
              type="email"
              className="wpdl-registration-form__input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <label className="wpdl-registration-form__field">
            <span className="wpdl-registration-form__label">Phone</span>
            <input
              type="tel"
              className="wpdl-registration-form__input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
          </label>
          <button type="submit" className="wpdl-registration-form__submit button button-primary" disabled={loading}>
            {loading ? "Saving…" : "Continue to Ring Builder"}
          </button>
        </form>
      </div>
    </div>
  );
}
