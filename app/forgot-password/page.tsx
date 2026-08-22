"use client";

import Link from "next/link";
import { useState } from "react";
import BrandName from "@/app/components/BrandName";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!API_URL) {
      setError("API URL is not configured.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/password-reset/request/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.detail || "Unable to request a password reset.");
      }
      setSubmitted(true);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to request a password reset.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="invite-page">
      <div className="invite-card">
        <div className="invite-brand"><BrandName /></div>
        <header className="invite-header">
          <p className="invite-eyebrow">CLIENT ACCESS</p>
          <h1>Reset your password</h1>
          <p>Enter your account email and we will send a secure reset link.</p>
        </header>

        {submitted ? (
          <div className="invite-result">
            <div className="invite-result-mark" aria-hidden="true">✓</div>
            <h1>Check your inbox</h1>
            <p>
              If an active account exists for that email, a password reset link
              has been sent.
            </p>
            <Link href="/login" className="invite-link">
              Return to login <span aria-hidden="true">→</span>
            </Link>
          </div>
        ) : (
          <form className="invite-form" onSubmit={handleSubmit}>
            <div className="invite-field">
              <label htmlFor="reset-email">Email</label>
              <input
                id="reset-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            {error && <p className="invite-error" role="alert">{error}</p>}
            <button type="submit" className="invite-submit" disabled={loading}>
              {loading ? "Sending..." : "Send reset link →"}
            </button>
            <Link href="/login" className="invite-help-link invite-back-link">
              Back to login
            </Link>
          </form>
        )}

        <footer className="invite-footer">Secure client portal · LaBioMedia</footer>
      </div>
    </main>
  );
}
