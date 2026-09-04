import { Alert, Button, Checkbox, TextField } from "@gryt/ui";
import { useState } from "react";
import type { FormEvent } from "react";
import { ShaderBackground } from "./ShaderBackground";
import type { ShaderPalette } from "./ShaderBackground";
import "./signIn.css";

/**
 * The Gryt sign-in screen.
 *
 * A copy of the Keycloak login theme in Gryt-chat/auth, which is what someone
 * actually sees when they sign in to a Gryt server. The theme spreads this
 * across a Template, a Form and a Page because Keycloak needs it to; here it is
 * one file, because that is the useful thing to copy.
 *
 * The layout is CSS, not components: the two columns and the brand panel are in
 * ./signIn.css, because no component owns a page.
 *
 * The form posts nowhere. In the theme, `action` is Keycloak's login URL and
 * the field names — `username`, `password`, `rememberMe` — are its contract, so
 * they are kept exactly. Wire them to your own endpoint and the markup does not
 * change.
 *
 * The `palette` prop is for the theme generator, which changes the theme
 * without remounting this.
 */
export function SignInScreen({ palette }: { palette?: ShaderPalette } = {}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const username = String(form.get("username") ?? "").trim();
    const password = String(form.get("password") ?? "");

    // A wrong password must not tell you whether the account exists, so
    // Keycloak reports one error across both fields rather than naming the one
    // that failed. Rendering it once, above the form, keeps that property.
    if (username === "" || password === "") {
      setError("Invalid username or password.");
      return;
    }

    setError(null);
    setSubmitting(true);
    window.setTimeout(() => setSubmitting(false), 1200);
  }

  return (
    <div className="gryt-auth-stage">
      <ShaderBackground palette={palette} />

      <div className="gryt-auth-layout">
        {/* The brand panel. This is often the first Gryt surface someone sees —
            arriving from an invite link, before they have any idea what Gryt is
            — so it says so. */}
        <aside className="gryt-auth-brand">
          <div className="gryt-auth-wordmark">Gryt</div>

          <div className="gryt-auth-pitch-block">
            <p className="gryt-auth-pitch">Voice, text and video chat.</p>
            <p className="gryt-auth-pitch-sub">Self-hosted and open source.</p>
          </div>

          <ul className="gryt-auth-chips">
            <li>Own your data</li>
            <li>Host your server</li>
            <li>Build your client</li>
          </ul>
        </aside>

        <main className="gryt-auth-main">
          <div className="gryt-auth-shell">
            <header className="gryt-auth-header">
              <h1 className="gryt-auth-title">Sign in to your account</h1>
            </header>

            {/* No card. The brand panel is the page's structure, so a Surface
                around the form here would be a box inside a box. */}
            <form className="gryt-auth-form" onSubmit={onSubmit}>
              {error ? <Alert severity="error">{error}</Alert> : null}

              <TextField
                id="username"
                name="username"
                type="email"
                label="Email"
                autoComplete="username"
                aria-invalid={error !== null}
                error={error !== null}
              />

              <TextField
                id="password"
                name="password"
                type="password"
                label="Password"
                autoComplete="current-password"
                aria-invalid={error !== null}
                error={error !== null}
              />

              <div className="gryt-auth-row">
                <label className="gryt-auth-remember">
                  <Checkbox id="rememberMe" name="rememberMe" />
                  Remember me
                </label>
                <a className="gryt-auth-link" href="#reset">
                  Forgot password?
                </a>
              </div>

              <div className="gryt-auth-actions">
                <Button type="submit" size="large" disabled={submitting}>
                  {submitting ? "Signing in…" : "Sign in"}
                </Button>
              </div>

              {/* Other ways in. Keycloak decides at runtime whether any exist —
                  passkeys and OTP both surface here — so this whole region
                  comes and goes, and the rule above it belongs to the region
                  rather than sitting on the page waiting for content. */}
              <div className="gryt-auth-alternatives">
                <Button type="button" tone="neutral" size="large">
                  Sign in with a passkey
                </Button>
              </div>
            </form>

            <div className="gryt-auth-footer">
              <span>New here?</span>
              <a className="gryt-auth-link" href="#register">
                Create an account
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
