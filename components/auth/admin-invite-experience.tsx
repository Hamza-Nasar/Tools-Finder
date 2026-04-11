"use client";

import { type FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import { ArrowRight, KeyRound, Mail, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/utils";

type InvitePreview = {
  email: string;
  name?: string | null;
  expiresAt: string;
};

type ApiErrorPayload = {
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

export function AdminInviteExperience({
  token,
  invite,
  currentUserEmail,
  googleEnabled
}: {
  token: string;
  invite: InvitePreview | null;
  currentUserEmail?: string | null;
  googleEnabled: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState(invite?.name ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inviteUrl = `/auth/admin-invite?token=${encodeURIComponent(token)}`;
  const signedInWithInvitedEmail = Boolean(
    currentUserEmail && invite?.email && currentUserEmail.toLowerCase() === invite.email.toLowerCase()
  );
  const signedInWithWrongEmail = Boolean(
    currentUserEmail && invite?.email && currentUserEmail.toLowerCase() !== invite.email.toLowerCase()
  );

  async function acceptInvite(input: { useCurrentSession: boolean }) {
    const passwordError = input.useCurrentSession ? null : validatePassword(password);

    if (passwordError) {
      setError(passwordError);
      return;
    }

    setError(null);

    const response = await fetch("/api/admin/invites/accept", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        token,
        name: name.trim() || undefined,
        password: input.useCurrentSession ? undefined : password
      })
    });
    const payload = (await response.json().catch(() => null)) as ApiErrorPayload | null;

    if (!response.ok) {
      setError(getApiErrorMessage(payload, "Could not accept admin invite."));
      return;
    }

    if (!input.useCurrentSession && invite?.email) {
      const result = await signIn("credentials", {
        redirect: false,
        email: invite.email,
        password,
        callbackUrl: "/admin"
      });

      if (result?.error) {
        setError("Admin account was created, but automatic login failed. Use the login page with this password.");
        return;
      }
    }

    router.push("/admin");
    router.refresh();
  }

  function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      await acceptInvite({ useCurrentSession: false });
    });
  }

  if (!invite) {
    return (
      <div className="page-frame py-12 md:py-16">
        <Card className="mx-auto max-w-xl shadow-glow">
          <CardHeader>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-destructive/20 bg-destructive/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-destructive">
              <ShieldCheck className="h-3.5 w-3.5" />
              Invite unavailable
            </div>
            <CardTitle className="mt-4">This admin invite cannot be used.</CardTitle>
            <CardDescription>
              Ask an existing admin to send a new invite link.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-frame py-12 md:py-16">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.94fr_1.06fr]">
        <Card className="hero-mesh shadow-glow">
          <CardHeader>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin invite
            </div>
            <CardTitle className="mt-6 text-4xl md:text-5xl">Accept your admin access.</CardTitle>
            <CardDescription className="text-base">
              This one-time link is locked to {invite.email} and expires {formatDate(invite.expiresAt)}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[1.2rem] border border-white/80 bg-white/76 p-5">
              <p className="text-sm font-semibold text-foreground">Invited email</p>
              <p className="mt-1 text-sm text-muted-foreground">{invite.email}</p>
            </div>
            <div className="rounded-[1.2rem] border border-white/80 bg-white/76 p-5">
              <p className="text-sm font-semibold text-foreground">Allowed methods</p>
              <p className="mt-1 text-sm text-muted-foreground">Create a password or continue with a verified Google account using the invited email.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-glow">
          <CardHeader className="border-b border-border/70 bg-white/80">
            <CardTitle>Finish setup</CardTitle>
            <CardDescription>No public admin signup is available. This invite is required.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {signedInWithInvitedEmail ? (
              <div className="space-y-4">
                <div className="rounded-[1.2rem] border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
                  You are signed in as {currentUserEmail}. Accept the invite to enable admin access.
                </div>
                <Button
                  type="button"
                  size="lg"
                  className="w-full justify-center gap-2"
                  disabled={isPending}
                  onClick={() => {
                    startTransition(async () => {
                      await acceptInvite({ useCurrentSession: true });
                    });
                  }}
                >
                  Accept invite
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ) : null}

            {signedInWithWrongEmail ? (
              <div className="space-y-4">
                <div className="rounded-[1.2rem] border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  You are signed in as {currentUserEmail}. This invite is for {invite.email}.
                </div>
                <Button type="button" variant="outline" className="w-full justify-center" onClick={() => void signOut({ callbackUrl: inviteUrl })}>
                  Sign out and use invited email
                </Button>
              </div>
            ) : null}

            {!currentUserEmail ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full justify-center gap-3"
                  disabled={!googleEnabled || isPending}
                  onClick={() => {
                    setError(null);
                    void signIn("google", { callbackUrl: inviteUrl });
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

                <form className="space-y-4" onSubmit={handlePasswordSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <div className="relative">
                      <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Admin name"
                        className="pl-11"
                        autoComplete="name"
                        minLength={2}
                        maxLength={80}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="email" type="email" value={invite.email} className="pl-11" readOnly />
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
                    <span>{isPending ? "Accepting invite..." : "Create admin account"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
