"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AcceptInvitationPage() {
  const [uid, setUid] = useState("");
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");

  const [status, setStatus] = useState("Checking invitation...");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let active = true;
    async function validateInvitation() {
      if (!API_URL) {
        if (active) setStatus("API URL is not configured.");
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const uidParam = params.get("uid");
      const tokenParam = params.get("token");
      if (!uidParam || !tokenParam) {
        if (active) setStatus("Invalid invitation link.");
        return;
      }
      try {
        const res = await fetch(`${API_URL}/api/auth/invitations/validate/?uid=${uidParam}&token=${tokenParam}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.detail);
        }
        if (active) { setUid(uidParam); setToken(tokenParam); setEmail(data.email); setName(data.name); setStatus(""); }
      } catch (err) {
        if (active) setStatus(err instanceof Error ? err.message : "Invalid invitation link.");
      }
    }
    void validateInvitation();
    return () => { active = false; };
  }, []);


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!API_URL) {
      setStatus("API URL is not configured.");
      return;
    }

    setStatus("Setting password...");

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
          password_confirmation: confirmation,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setStatus(data.detail || "Could not set password.");
      return;
    }

    setSuccess(true);
    setStatus("");
  }

if (success) {
  return (
    <main className="invite-page">
      <div className="invite-card">

        <div className="invite-brand">
          LABIO MEDIA
        </div>

        <div className="invite-result">

          <div className="invite-result-mark">
            ✓
          </div>

          <h1>
            Password created
          </h1>

          <p>
            Your account is ready.
            You can now log in and access your client area.
          </p>

          <Link
            href="/login"
            className="invite-link"
          >
            Go to login
            <span>→</span>
          </Link>

        </div>

        <div className="invite-footer">
          © LaBioMedia
        </div>

      </div>
    </main>
  );
}


return (
  <main className="invite-page">

    <div className="invite-card">

      <div className="invite-brand">
        LABIO MEDIA
      </div>


      <header className="invite-header">

        <p className="invite-eyebrow">
          CLIENT ACCESS
        </p>

        <h1>
          Set up your account
        </h1>

        <p>
          Create your password to access your
          LaBioMedia client area.
        </p>

      </header>


      {status && (
        <div className="invite-loading">
          {status}
        </div>
      )}


      {email && !status && (
        <p className="invite-footer">
          Account:
          <br />
          {name} ({email})
        </p>
      )}



      {!status && (

        <form
          className="invite-form"
          onSubmit={handleSubmit}
        >

          <div className="invite-field">

            <label>
              Password
            </label>

            <input
              type="password"
              required
              value={password}
              onChange={(e)=>
                setPassword(e.target.value)
              }
            />

          </div>



          <div className="invite-field">

            <label>
              Confirm password
            </label>

            <input
              type="password"
              required
              value={confirmation}
              onChange={(e)=>
                setConfirmation(e.target.value)
              }
            />

          </div>



          <button
            type="submit"
            className="invite-submit"
          >

            <span>
              Create password
            </span>

            <span>
              →
            </span>

          </button>


        </form>

      )}


      <div className="invite-footer">
        Secure client access · LaBioMedia
      </div>


    </div>

  </main>
);
}
