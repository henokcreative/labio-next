"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import BrandName from "@/app/components/BrandName";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type InvitationState =
  | "loading"
  | "valid"
  | "invalid"
  | "submitting"
  | "success";

function InviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const [state, setState] = useState<InvitationState>("loading");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState<string[]>([]);

  useEffect(() => {
    async function validateInvitation() {
      if (!API_URL) {
        setState("invalid");
        setError("API URL is not configured.");
        return;
      }

      if (!uid || !token) {
        setState("invalid");
        setError("This invitation link is incomplete or invalid.");
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/auth/invitations/validate/?uid=${encodeURIComponent(
            uid
          )}&token=${encodeURIComponent(token)}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setState("invalid");
          setError(
            data.detail ||
              "This invitation link is invalid or has expired."
          );
          return;
        }

        setName(data.name || "");
        setEmail(data.email || "");
        setState("valid");
      } catch {
        setState("invalid");
        setError(
          "We couldn't connect to LaBioMedia. Please try again later."
        );
      }
    }

    validateInvitation();
  }, [uid, token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!API_URL) {
      setState("valid");
      setError("API URL is not configured.");
      return;
    }

    if (!uid || !token) return;

    setState("submitting");
    setError("");
    setPasswordError([]);

    const formData = new FormData(event.currentTarget);

    const password = String(formData.get("password") || "");
    const passwordConfirmation = String(
      formData.get("password_confirmation") || ""
    );

    try {
      const response = await fetch(
        `${API_URL}/api/auth/invitations/accept/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uid,
            token,
            password,
            password_confirmation: passwordConfirmation,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.password) {
          setPasswordError(data.password);
        }

        if (data.password_confirmation) {
          setError(data.password_confirmation.join(" "));
        } else if (data.detail) {
          setError(data.detail);
        } else if (data.password) {
          setError("Please choose a valid password.");
        } else {
          setError("We couldn't complete your account setup.");
        }

        setState("valid");
        return;
      }

      setState("success");
    } catch {
      setError(
        "We couldn't connect to LaBioMedia. Please try again."
      );
      setState("valid");
    }
  }

  if (state === "loading") {
    return (
      <main className="invite-page">
        <div className="invite-card">
          <div className="invite-brand"><BrandName /></div>

          <div className="invite-loading">
            <span className="invite-spinner" />
            <p>Checking your invitation...</p>
          </div>
        </div>
      </main>
    );
  }

  if (state === "invalid") {
    return (
      <main className="invite-page">
        <div className="invite-card">
          <div className="invite-brand"><BrandName /></div>

          <div className="invite-result">
            <div className="invite-result-mark invite-result-mark-error">
              ×
            </div>

            <h1>Invitation unavailable</h1>

            <p>{error}</p>

            <Link href="/" className="invite-link">
              Return to LaBio Media
              <span>→</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (state === "success") {
    return (
      <main className="invite-page">
        <div className="invite-card">
          <div className="invite-brand"><BrandName /></div>

          <div className="invite-result">
            <div className="invite-result-mark">✓</div>

            <h1>Your account is ready.</h1>

            <p>
              Your password has been set successfully. You can now
              sign in to your LaBio Media client account.
            </p>

            <button
              type="button"
              className="invite-submit"
              onClick={() => router.push("/login")}
            >
              Continue to sign in
              <span>→</span>
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="invite-page">
      <div className="invite-card">
        <div className="invite-brand"><BrandName /></div>

        <div className="invite-header">
          <p className="invite-eyebrow">CLIENT ACCOUNT</p>

          <h1>
            Welcome
            {name ? `, ${name.split(" ")[0]}` : ""}.
          </h1>

          <p>
            Your LaBio Media client account is ready.
            Set a password below to complete your account setup.
          </p>
        </div>

        <form className="invite-form" onSubmit={handleSubmit}>
          <div className="invite-field">
            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              value={email}
              disabled
            />
          </div>

          <div className="invite-field">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              autoFocus
            />
          </div>

          <div className="invite-field">
            <label htmlFor="password_confirmation">
              Confirm password
            </label>

            <input
              id="password_confirmation"
              name="password_confirmation"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          {passwordError.length > 0 && (
            <div className="invite-error" role="alert">
              <ul>
                {passwordError.map((message, index) => (
                  <li key={index}>{message}</li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <p className="invite-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="invite-submit"
            disabled={state === "submitting"}
          >
            {state === "submitting"
              ? "Setting password..."
              : "Set password"}

            <span>→</span>
          </button>
        </form>

        <p className="invite-footer">
          This invitation is secure and can only be used once.
        </p>
      </div>
    </main>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={<main className="invite-page"><div className="invite-card"><div className="invite-brand"><BrandName /></div><div className="invite-loading">Loading invitation…</div></div></main>}>
      <InviteContent />
    </Suspense>
  );
}
