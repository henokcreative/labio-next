"use client";

import { FormEvent, useState } from "react";

type FormStatus = "idle" | "sending" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<FormStatus>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (status === "sending") return;

    const form = event.currentTarget;
    const formData = new FormData(form);

    const data = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      organisation: String(formData.get("organisation") || "").trim(),
      service: String(formData.get("service") || "").trim(),
      message: String(formData.get("message") || "").trim(),
    };

    setStatus("sending");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error("API URL is not configured.");
      }

      const response = await fetch(
        `${apiUrl}/api/contacts/submit/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}`
        );
      }

      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        className="contact-success"
        role="status"
        aria-live="polite"
      >
        <div
          className="contact-success-mark"
          aria-hidden="true"
        >
          ✓
        </div>

        <h3>Thank you.</h3>

        <p>
          Your message has been sent successfully.
          I&apos;ll get back to you as soon as possible.
        </p>

        <button
          type="button"
          className="contact-submit"
          onClick={() => setStatus("idle")}
        >
          Send another message
          <span aria-hidden="true">→</span>
        </button>
      </div>
    );
  }

  return (
    <form
      className="contact-form"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="contact-field">
        <label htmlFor="name">
          Name <span aria-hidden="true">*</span>
        </label>

        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          disabled={status === "sending"}
        />
      </div>

      <div className="contact-field">
        <label htmlFor="email">
          Email <span aria-hidden="true">*</span>
        </label>

        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          disabled={status === "sending"}
        />
      </div>

      <div className="contact-field">
        <label htmlFor="organisation">
          Organisation
        </label>

        <input
          id="organisation"
          name="organisation"
          type="text"
          autoComplete="organization"
          disabled={status === "sending"}
        />
      </div>

      <div className="contact-field">
        <label htmlFor="service">
          What can I help with?
        </label>

        <select
          id="service"
          name="service"
          defaultValue=""
          disabled={status === "sending"}
        >
          <option value="" disabled>
            Select a service
          </option>

          <option value="web">Web</option>
          <option value="video">Video</option>
          <option value="photography">
            Photography
          </option>
          <option value="design">Design</option>
          <option value="other">
            Something else
          </option>
        </select>
      </div>

      <div className="contact-field contact-field-message">
        <label htmlFor="message">
          Message <span aria-hidden="true">*</span>
        </label>

        <textarea
          id="message"
          name="message"
          rows={6}
          required
          placeholder="Tell me a little about your project..."
          disabled={status === "sending"}
        />
      </div>

      {status === "error" && (
        <p
          className="contact-error"
          role="alert"
        >
          Something went wrong while sending your
          message. Please try again, or email me directly.
        </p>
      )}

      <button
        type="submit"
        className="contact-submit"
        disabled={status === "sending"}
      >
        {status === "sending"
          ? "Sending..."
          : "Send message"}

        <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}
