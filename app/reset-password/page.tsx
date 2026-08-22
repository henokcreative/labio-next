"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import BrandName from "@/app/components/BrandName";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordShell loading />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid") || "";
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!API_URL) {
      setError("API URL is not configured.");
      return;
    }
    if (!uid || !token) {
      setError("This password reset link is invalid or has expired.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/password-reset/confirm/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid,
          token,
          password,
          password_confirmation: confirmation,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          data.password?.[0]
            || data.password_confirmation?.[0]
            || data.detail
            || "Unable to reset your password.",
        );
      }
      window.history.replaceState(null, "", "/reset-password");
      setSuccess(true);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to reset your password.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="invite-page">
      <div className="invite-card">
        <div className="invite-brand"><BrandName /></div>
        {success ? (
          <div className="invite-result">
            <div className="invite-result-mark" aria-hidden="true">✓</div>
            <h1>Password updated</h1>
            <p>Your new password is ready. You can now sign in.</p>
            <Link href="/login" className="invite-link">
              Go to login <span aria-hidden="true">→</span>
            </Link>
          </div>
        ) : (
          <>
            <header className="invite-header">
              <p className="invite-eyebrow">CLIENT ACCESS</p>
              <h1>Choose a new password</h1>
              <p>Use a strong password you do not use for another account.</p>
            </header>
            <form className="invite-form" onSubmit={handleSubmit}>
              <div className="invite-field">
                <label htmlFor="new-password">New password</label>
                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
              <div className="invite-field">
                <label htmlFor="confirm-password">Confirm new password</label>
                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  required
                />
              </div>
              {error && <p className="invite-error" role="alert">{error}</p>}
              <button type="submit" className="invite-submit" disabled={loading}>
                {loading ? "Updating..." : "Set new password →"}
              </button>
            </form>
          </>
        )}
        <footer className="invite-footer">Secure client portal · LaBioMedia</footer>
      </div>
    </main>
  );
}

function ResetPasswordShell({ loading }: { loading: boolean }) {
  return (
    <main className="invite-page">
      <div className="invite-card">
        <div className="invite-brand"><BrandName /></div>
        <header className="invite-header">
          <p className="invite-eyebrow">CLIENT ACCESS</p>
          <h1>Choose a new password</h1>
          <p>{loading ? "Preparing your secure reset form..." : ""}</p>
        </header>
      </div>
    </main>
  );
}
