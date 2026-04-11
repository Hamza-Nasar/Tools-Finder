"use client";

import { type FormEvent, useMemo, useState, useTransition } from "react";
import { Copy, ExternalLink, Mail, ShieldCheck, UserRound, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/utils";

type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  passwordConfigured?: boolean;
  lastLoginAt?: string | null;
  lastLoginProvider?: "credentials" | "google" | null;
  createdAt: string;
};

type AdminInvite = {
  id: string;
  email: string;
  name?: string | null;
  invitedByEmail: string;
  expiresAt: string;
  createdAt: string;
};

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

export function UserManagementConsole({
  initialUsers,
  initialInvites,
  currentUserId
}: {
  initialUsers: ManagedUser[];
  initialInvites: AdminInvite[];
  currentUserId: string;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [invites, setInvites] = useState(initialInvites);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [pendingInviteId, setPendingInviteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const adminCount = useMemo(() => users.filter((user) => user.role === "admin").length, [users]);

  async function readPayload(response: Response) {
    return (await response.json().catch(() => null)) as ApiErrorPayload | {
      data?: {
        user?: ManagedUser;
        invite?: AdminInvite;
        inviteUrl?: string;
        delivered?: boolean;
      };
      invite?: AdminInvite;
      inviteUrl?: string;
      delivered?: boolean;
    } | null;
  }

  function upsertUser(user: ManagedUser) {
    setUsers((currentUsers) => currentUsers.map((item) => (item.id === user.id ? user : item)));
  }

  async function handleCreateInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setInviteUrl(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Email is required.");
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/admin/invites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: name.trim() || undefined,
          email: normalizedEmail
        })
      });
      const payload = await readPayload(response);

      if (!response.ok) {
        setError(getApiErrorMessage(payload as ApiErrorPayload | null, "Could not create admin invite."));
        return;
      }

      const result = (payload as {
        data?: {
          invite?: AdminInvite;
          inviteUrl?: string;
          delivered?: boolean;
        };
        invite?: AdminInvite;
        inviteUrl?: string;
        delivered?: boolean;
      } | null);
      const invite = result?.data?.invite ?? result?.invite;
      const createdInviteUrl = result?.data?.inviteUrl ?? result?.inviteUrl ?? null;
      const delivered = result?.data?.delivered ?? result?.delivered;

      if (invite) {
        setInvites((currentInvites) => [invite, ...currentInvites.filter((item) => item.email !== invite.email)]);
      }

      setName("");
      setEmail("");
      setInviteUrl(createdInviteUrl);
      setMessage(
        delivered
          ? "Invite email sent. The link is also available below."
          : "Invite link created. Email delivery is not configured, so send this link manually."
      );
    });
  }

  async function copyInviteLink() {
    if (!inviteUrl) {
      return;
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(inviteUrl);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = inviteUrl;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setMessage("Invite link copied.");
  }

  async function revokeInvite(invite: AdminInvite) {
    setError(null);
    setMessage(null);
    setPendingInviteId(invite.id);

    const response = await fetch(`/api/admin/invites/${invite.id}`, {
      method: "DELETE"
    });

    setPendingInviteId(null);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as ApiErrorPayload | null;
      setError(getApiErrorMessage(payload, "Could not revoke invite."));
      return;
    }

    setInvites((currentInvites) => currentInvites.filter((item) => item.id !== invite.id));
    setMessage("Invite revoked.");
  }

  async function removeAdmin(user: ManagedUser) {
    setError(null);
    setMessage(null);
    setPendingUserId(user.id);

    const response = await fetch(`/api/admin/users/${user.id}/role`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        role: "user"
      })
    });
    const payload = await readPayload(response);

    setPendingUserId(null);

    if (!response.ok) {
      setError(getApiErrorMessage(payload as ApiErrorPayload | null, "Could not remove admin access."));
      return;
    }

    const updatedUser = (payload as { data?: { user?: ManagedUser } } | null)?.data?.user;

    if (updatedUser) {
      upsertUser(updatedUser);
    }

    setMessage("Admin access removed.");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-secondary/45 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-secondary-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              Invite only
            </div>
            <CardTitle className="mt-4">Invite an admin</CardTitle>
            <CardDescription>
              Generate a one-time link for a specific email. That link is the only way to add another admin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCreateInvite}>
              <div className="space-y-2">
                <Label htmlFor="invite-name">Full name</Label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="invite-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Admin name"
                    className="pl-11"
                    minLength={2}
                    maxLength={80}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invite-email">Email address</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="invite-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@company.com"
                    className="pl-11"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {error ? (
                <div className="rounded-[1.2rem] border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              ) : null}

              {message ? (
                <div className="rounded-[1.2rem] border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
                  {message}
                </div>
              ) : null}

              {inviteUrl ? (
                <div className="space-y-3 rounded-[1.2rem] border border-border/70 bg-secondary/30 p-3">
                  <Label htmlFor="invite-url">Invite link</Label>
                  <Input id="invite-url" value={inviteUrl} readOnly className="text-xs" onFocus={(event) => event.currentTarget.select()} />
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button type="button" variant="outline" className="w-full justify-center" onClick={() => void copyInviteLink()}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy invite link
                    </Button>
                    <Button asChild type="button" variant="outline" className="w-full justify-center">
                      <a href={inviteUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open invite
                      </a>
                    </Button>
                  </div>
                </div>
              ) : null}

              <Button type="submit" className="w-full justify-center" disabled={isPending}>
                {isPending ? "Creating invite..." : "Create invite link"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending invites</CardTitle>
            <CardDescription>Unused admin links expire automatically after seven days.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {invites.length ? (
              invites.map((invite) => (
                <div key={invite.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border px-4 py-4">
                  <div>
                    <p className="font-semibold">{invite.name ?? invite.email}</p>
                    <p className="text-sm text-muted-foreground">{invite.email}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Expires {formatDate(invite.expiresAt)}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={pendingInviteId === invite.id}
                    onClick={() => void revokeInvite(invite)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Revoke
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No pending admin invites.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User management</CardTitle>
          <CardDescription>Review users and remove admin access. New admins must accept an invite link.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {users.length ? (
            users.map((user) => {
              const isCurrentUser = user.id === currentUserId;
              const isLastAdmin = user.role === "admin" && adminCount <= 1;
              const canRemoveAdmin = user.role === "admin" && !isCurrentUser && !isLastAdmin;

              return (
                <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border px-4 py-4">
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {user.passwordConfigured ? "Email login enabled" : "Google-only account"}
                      {user.lastLoginAt ? ` | Last login ${formatDate(user.lastLoginAt)}` : ""}
                      {user.lastLoginProvider ? ` | ${user.lastLoginProvider}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm text-muted-foreground">Joined {formatDate(user.createdAt)}</span>
                    <Badge variant={user.role === "admin" ? "accent" : "muted"}>{user.role}</Badge>
                    {user.role === "admin" ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!canRemoveAdmin || pendingUserId === user.id}
                        onClick={() => void removeAdmin(user)}
                      >
                        Remove admin
                      </Button>
                    ) : null}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">No user records found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
