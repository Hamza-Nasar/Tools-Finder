# Deployment Guide

## Target infrastructure

- Frontend and server runtime: Vercel
- Database: MongoDB Atlas
- Payments: Stripe
- Email: Resend-compatible API

## Vercel

1. Import the repository into Vercel.
2. Configure environment variables from [environment.md](./environment.md).
3. Set the production domain.
4. Make sure `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL` match the deployed domain exactly.
5. Deploy.

## Build verification

Local verification commands:

```powershell
$env:NODE_OPTIONS='--max-old-space-size=4096'; cmd /c npm run typecheck
$env:NODE_OPTIONS='--max-old-space-size=4096'; cmd /c npm run build
```

## Production checks

- Open `/api/health`
- Open `/sitemap.xml`
- Verify NextAuth sign-in
- Verify admin access control
- Verify a submission can be created
- Verify Stripe checkout and webhook delivery
- Verify `/go/[slug]` redirect tracking

## Recommended Vercel settings

- Enable automatic production deployments from your main branch
- Keep preview deployments enabled for review
- Use Vercel environment variables for all secrets
- Add the production domain to Stripe allowed redirect URLs and OAuth callbacks

## Monitoring recommendations

- Watch Vercel function logs for API errors
- Monitor MongoDB Atlas performance metrics
- Monitor Stripe webhook delivery retries
- Monitor email provider delivery rate and bounce events
