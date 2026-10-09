# Vercel Staging / Preview Deployment

## Connect project
1. Create a personal Vercel account.
2. Import your GitHub `adlc-learning-poc` repository.
3. Keep `main` as the Production Branch.
4. Deploy.

## How staging works in this POC
Vercel creates Preview Deployments for non-production branches. Therefore the `staging` branch is your learning staging environment.

```text
feature branch -> preview
staging branch -> staging preview
main -> production
```

You do not need a second Vercel project for this POC.

## Environment variables
The sample application needs no secrets.

Suggested local `.env.local`:

```bash
NEXT_PUBLIC_APP_NAME="ADLC Learning POC"
NEXT_PUBLIC_APP_ENV="local"
```

For Vercel Preview, optionally set:

```text
NEXT_PUBLIC_APP_ENV=staging
```

For Production:

```text
NEXT_PUBLIC_APP_ENV=production
```

Never put Jira/GitHub/OAuth credentials in `NEXT_PUBLIC_*` values.
