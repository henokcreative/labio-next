"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BrandName from "@/app/components/BrandName";


const API_URL = process.env.NEXT_PUBLIC_API_URL;


export default function LoginPage() {

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {

    e.preventDefault();

    setError("");

    if (!API_URL) {
      setError("API URL is not configured.");
      return;
    }

    setLoading(true);


    try {

      const response = await fetch(
        `${API_URL}/api/auth/login/`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

body: JSON.stringify({

    email: email,

    password: password,

}),
        }
      );


      const data = await response.json();


      if (!response.ok) {
throw new Error(
  data.non_field_errors?.[0] ||
  data.email?.[0] ||
  "Invalid login"
);
      }


      localStorage.setItem(
        "access_token",
        data.access
      );


      localStorage.setItem(
        "refresh_token",
        data.refresh
      );


      router.push(
        data.is_portal_staff
          ? "/staff/messages"
          : "/client/dashboard"
      );


    } catch (err: unknown) {

      setError(
        err instanceof Error ? err.message : "Unable to sign in."
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

          <p className="invite-eyebrow">
            CLIENT ACCESS
          </p>


          <h1>
            Welcome back
          </h1>


          <p>
            Sign in to access your projects,
            messages and files.
          </p>


        </header>



        <form
          className="invite-form"
          onSubmit={handleSubmit}
        >


          <div className="invite-field">

            <label>
              Email
            </label>


            <input

              type="email"

              value={email}

              onChange={(e)=>
                setEmail(e.target.value)
              }

              required

              placeholder="your@email.com"

            />

          </div>




          <div className="invite-field">

            <label>
              Password
            </label>


            <input

              type="password"

              value={password}

              onChange={(e)=>
                setPassword(e.target.value)
              }

              required

              placeholder="Password"

            />

          </div>




          {
            error && (

              <p className="invite-error">

                {error}

              </p>

            )
          }




          <button

            type="submit"

            className="invite-submit"

            disabled={loading}

          >

            {
              loading
              ? "Signing in..."
              : "Sign in →"
            }


          </button>



        </form>



        <footer className="invite-footer">

          Secure client portal · LaBioMedia

        </footer>


      </div>


    </main>

  );

}
