# EmailJS Admin Invite Template

Use this design in EmailJS template editor with these variables:

- `{{to_email}}`
- `{{invited_by_email}}`
- `{{invite_url}}`
- `{{expires_at}}`

Suggested subject:

```text
Your Toolverse Atlas admin invite
```

Template body (HTML):

```html
<div style="margin:0;padding:24px;background:#f3f7fb;font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #dbe5ef;border-radius:16px;overflow:hidden;">
    <tr>
      <td style="padding:24px 24px 8px;background:linear-gradient(135deg,#0ea5e9,#0284c7);color:#ffffff;">
        <p style="margin:0;font-size:12px;letter-spacing:.12em;text-transform:uppercase;opacity:.9;">Toolverse Atlas</p>
        <h1 style="margin:10px 0 0;font-size:26px;line-height:1.25;">Admin Invite</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:24px;">
        <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">
          <strong>{{invited_by_email}}</strong> invited you to manage Toolverse Atlas as an admin.
        </p>
        <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#334155;">
          This one-time invite expires on <strong>{{expires_at}}</strong>.
        </p>
        <a href="{{invite_url}}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#0284c7;color:#ffffff;text-decoration:none;font-weight:600;">
          Accept Admin Invite
        </a>
        <p style="margin:18px 0 0;font-size:12px;line-height:1.6;color:#64748b;">
          If you were not expecting this invite, you can safely ignore this email.
        </p>
      </td>
    </tr>
  </table>
</div>
```

Notes:

- In EmailJS, set recipient mapping so `to_email` is used as destination.
- Keep template ID configured via env variable: `EMAILJS_ADMIN_INVITE_TEMPLATE_ID`.
