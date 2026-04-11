"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { ArrowRight, KeyRound, Mail, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthMode = "login" | "signup";
type ValidationErrorPayload = {
  error?: string;
  details?: {
    formErrors?: string[];
    fieldErrors?: Record<string, string[] | undefined>;
  };
};

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.2-.9 2.2-1.9 2.9l3.1 2.4c1.8-1.7 2.8-4.1 2.8-7 0-.7-.1-1.4-.2-2.1H12Z" />
      <path fill="#34A853" d="M12 21c2.7 0 5-.9 6.7-2.5l-3.1-2.4c-.9.6-2 1-3.6 1-2.7 0-5-1.8-5.8-4.3l-3.2 2.5C4.7 18.7 8.1 21 12 21Z" />
      <path fill="#4A90E2" d="M6.2 12.8c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8L3 6.7C2.4 8 2 9.5 2 11s.4 3 1 4.3l3.2-2.5Z" />
      <path fill="#FBBC05" d="M12 5c1.5 0 2.9.5 4 1.5l3-3C17 1.7 14.7 1 12 1 8.1 1 4.7 3.3 3 6.7l3.2 2.5C7 6.8 9.3 5 12 5Z" />
    </svg>
  );
}

function mapAuthError(error: string | null | undefined) {
  if (!error) {
    return "Authentication could not be completed.";
  }

  if (error === "CredentialsSignin") {
    return "Invalid email or password.";
  }

  return error;
}

function validateSignupFields(input: { name: string; password: string; confirmPassword: string }) {
  const normalizedName = input.name.trim();

  if (normalizedName && normalizedName.length < 2) {
    return "Full name must be at least 2 characters.";
  }

  if (input.password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  if (input.password.length > 72) {
    return "Password must be 72 characters or fewer.";
  }

  if (!/[a-z]/.test(input.password)) {
    return "Password must include a lowercase letter.";
  }

  if (!/[A-Z]/.test(input.password)) {
    return "Password must include an uppercase letter.";
  }

  if (!/[0-9]/.test(input.password)) {
    return "Password must include a number.";
  }

  if (input.password !== input.confirmPassword) {
    return "Passwords do not match.";
  }

  return null;
}

function extractApiErrorMessage(payload: ValidationErrorPayload | null, fallback: string) {
  const formError = payload?.details?.formErrors?.find(Boolean);

  if (formError) {
    return formError;
  }

  const firstFieldError = Object.values(payload?.details?.fieldErrors ?? {}).flat().find(Boolean);

  if (firstFieldError) {
    return firstFieldError;
  }

  return payload?.error ?? fallback;
}

export function AuthExperience({
  mode,
  callbackUrl,
  googleEnabled
}: {
  mode: AuthMode;
  callbackUrl: string;
  googleEnabled: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const isLogin = mode === "login";
  const alternateHref = useMemo(
    () => `/${isLogin ? "auth/signup" : "auth/login"}?callbackUrl=${encodeURIComponent(callbackUrl)}`,
    [callbackUrl, isLogin]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Email is required.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    startTransition(async () => {
      if (isLogin) {
        const result = await signIn("credentials", {
          redirect: false,
          email: normalizedEmail,
          password,
          callbackUrl
        });

        if (result?.error) {
          setError(mapAuthError(result.error));
          return;
        }

        router.push(result?.url ?? callbackUrl);
        router.refresh();
        return;
      }

      const signupValidationError = validateSignupFields({
        name,
        password,
        confirmPassword
      });

      if (signupValidationError) {
        setError(signupValidationError);
        return;
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: name.trim() || undefined,
          email: normalizedEmail,
          password
        })
      });

      const payload = (await response.json().catch(() => null)) as ValidationErrorPayload | null;

      if (!response.ok) {
        setError(extractApiErrorMessage(payload, "Could not create your account."));
        return;
      }

      const result = await signIn("credentials", {
        redirect: false,
        email: normalizedEmail,
        password,
        callbackUrl
      });

      if (result?.error) {
        setError(mapAuthError(result.error));
        return;
      }

      router.push(result?.url ?? callbackUrl);
      router.refresh();
    });
  }

  return (
    <div className="page-frame py-12 md:py-16">
      <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <Card className="hero-mesh overflow-hidden shadow-glow">
          <CardHeader className="border-b border-border/70">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              AI Tools Finder
            </div>
            <CardTitle className="mt-6 max-w-xl text-4xl md:text-5xl">
              {isLogin ? "Welcome back to your AI workspace." : "Create your account and start curating faster."}
            </CardTitle>
            <CardDescription className="max-w-2xl text-base md:text-lg">
              {isLogin
                ? "Log in with email or Google to save favorites, compare tools, submit listings, and keep your workflow stack in one place."
                : "Sign up with email or Google and get a polished directory account for saves, submissions, prompt discovery, and personalized tool tracking."}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pt-6 md:grid-cols-3">
            {[
              {
                icon: <Mail className="h-4 w-4" />,
                title: "Dual auth",
                description: "Use either email and password or Google from the same entry point."
              },
              {
                icon: <ShieldCheck className="h-4 w-4" />,
                title: "Saved progress",
                description: "Keep favorites, dashboard activity, and your stack attached to one account."
              },
              {
                icon: <KeyRound className="h-4 w-4" />,
                title: "Clean flow",
                description: "The auth pages match the rest of the site instead of dropping into a plain provider screen."
              }
            ].map((item) => (
              <div key={item.title} className="rounded-[1.5rem] border border-white/80 bg-white/76 p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  {item.icon}
                </div>
                <p className="mt-4 font-[family-name:var(--font-heading)] text-lg font-semibold">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="overflow-hidden shadow-glow">
          <CardHeader className="border-b border-border/70 bg-white/80">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-secondary/45 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-secondary-foreground">
              {isLogin ? <KeyRound className="h-3.5 w-3.5" /> : <UserRound className="h-3.5 w-3.5" />}
              {isLogin ? "Login" : "Signup"}
            </div>
            <CardTitle className="mt-4">{isLogin ? "Login to your account" : "Create a new account"}</CardTitle>
            <CardDescription>
              {isLogin
                ? "Use email and password or continue with Google."
                : "Start with email, or use Google if you prefer one-click signup."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full justify-center gap-3 rounded-[1.2rem]"
              disabled={!googleEnabled || isPending}
              onClick={() => {
                setError(null);
                void signIn("google", { callbackUrl });
              }}
            >
              <GoogleMark />
              <span>{googleEnabled ? "Continue with Google" : "Google login unavailable"}</span>
            </Button>

            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <span className="h-px flex-1 bg-border/70" />
              <span>Email</span>
              <span className="h-px flex-1 bg-border/70" />
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {!isLogin ? (
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Hamza Nasar"
                      className="pl-11"
                      autoComplete="name"
                      minLength={2}
                      maxLength={80}
                    />
                  </div>
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@company.com"
                    className="pl-11"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                      placeholder={isLogin ? "Enter your password" : "At least 8 characters"}
                      className="pl-11"
                      autoComplete={isLogin ? "current-password" : "new-password"}
                      required
                      minLength={8}
                      maxLength={72}
                    />
                  </div>
              </div>

              {!isLogin ? (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <div className="relative">
                    <ShieldCheck className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Repeat your password"
                      className="pl-11"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      maxLength={72}
                    />
                  </div>
                  <p className="text-xs leading-5 text-muted-foreground">
                    Use 8-72 characters with uppercase, lowercase, and at least one number.
                  </p>
                </div>
              ) : null}

              {error ? (
                <div className="rounded-[1.2rem] border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              ) : null}

              <Button type="submit" size="lg" className="w-full justify-center gap-2 rounded-[1.2rem]" disabled={isPending}>
                <span>{isLogin ? "Login with email" : "Create account"}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="rounded-[1.2rem] border border-border/70 bg-secondary/30 px-4 py-4 text-sm leading-6 text-muted-foreground">
              {isLogin
                ? "If you originally used Google, you can still continue with Google from above."
                : "Use the same email method each time so your saved tools, submissions, and workspace stay connected."}
            </div>

            <p className="text-sm text-muted-foreground">
              {isLogin ? "New here?" : "Already have an account?"}{" "}
              <Link href={alternateHref} className="font-semibold text-primary transition hover:text-primary/80">
                {isLogin ? "Create an account" : "Log in instead"}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
