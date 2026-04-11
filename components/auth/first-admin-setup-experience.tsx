"use client";

import { type FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight, KeyRound, Mail, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ApiErrorPayload = {
  error?: string;
  details?: {
    formErrors?: string[];
    fieldErrors?: Record<string, string[] | undefined>;
  };
};

function getApiErrorMessage(payload: ApiErrorPayload | null, fallback: string) {
  const formError = payload?.details?.formErrors?.find(Boolean);

  if (formError) {
    return formError;
  }

  const fieldError = Object.values(payload?.details?.fieldErrors ?? {}).flat().find(Boolean);

  return fieldError ?? payload?.error ?? fallback;
}

function validatePassword(password: string) {
  if (password.length < 8 || password.length > 72) {
    return "Password must be 8-72 characters.";
  }

  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    return "Password must include uppercase, lowercase, and a number.";
  }

  return null;
}

export function FirstAdminSetupExperience({
  token,
  setupOpen,
  setupConfigured
}: {
  token: string;
  setupOpen: boolean;
  setupConfigured: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    const passwordError = validatePassword(password);

    if (!name.trim()) {
      setError("Full name is required.");
      return;
    }

    if (!normalizedEmail) {
      setError("Email is required.");
      return;
    }

    if (passwordError) {
      setError(passwordError);
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/admin/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token,
          name: name.trim(),
          email: normalizedEmail,
          password
        })
      });
      const payload = (await response.json().catch(() => null)) as ApiErrorPayload | null;

      if (!response.ok) {
        setError(getApiErrorMessage(payload, "Could not complete first admin setup."));
        return;
      }

      const result = await signIn("credentials", {
        redirect: false,
        email: normalizedEmail,
        password,
        callbackUrl: "/admin"
      });

      if (result?.error) {
        setError("Admin was created, but automatic login failed. Use the login page with this password.");
        return;
      }

      router.push("/admin");
      router.refresh();
    });
  }

  if (!setupConfigured || !setupOpen) {
    return (
      <div className="page-frame py-12 md:py-16">
        <Card className="mx-auto max-w-xl shadow-glow">
          <CardHeader>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-destructive/20 bg-destructive/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-destructive">
              <ShieldCheck className="h-3.5 w-3.5" />
              Setup unavailable
            </div>
            <CardTitle className="mt-4">First admin setup is closed.</CardTitle>
            <CardDescription>
              Use an admin invite link from an existing admin.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-frame py-12 md:py-16">
      <Card className="mx-auto max-w-2xl shadow-glow">
        <CardHeader className="border-b border-border/70 bg-white/80">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-secondary/45 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-secondary-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            First admin
          </div>
          <CardTitle className="mt-4 text-4xl">Create the first admin account</CardTitle>
          <CardDescription>
            This page works only with your setup token and closes after the first admin is created.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Owner name"
                  className="pl-11"
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={80}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="owner@company.com"
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
                  placeholder="At least 8 characters"
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

            {error ? (
              <div className="rounded-[1.2rem] border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <Button type="submit" size="lg" className="w-full justify-center gap-2" disabled={isPending}>
              <span>{isPending ? "Creating admin..." : "Create first admin"}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
