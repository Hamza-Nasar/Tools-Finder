# Database Setup

## MongoDB Atlas

1. Create a MongoDB Atlas project and cluster.
2. Create a database user with read/write access.
3. Add your Vercel deployment IP ranges or use Atlas access rules that fit your security model.
4. Copy the connection string into `MONGODB_URI`.
5. Set `MONGODB_DB_NAME` to the target database name.

## Local development

Use a local MongoDB instance if you prefer:

```text
MONGODB_URI=mongodb://127.0.0.1:27017/aitoolsfinder
MONGODB_DB_NAME=aitoolsfinder
```

## Indexes

Indexes are defined in the Mongoose models and support:

- full-text search
- category and pricing filters
- featured sorting
- favorites, views, and clicks ranking
- featured listing expiration lookups

## Initial data flow

1. Start the app.
2. Sign in with the bootstrap admin account.
3. Create categories in the admin panel.
4. Add tools directly or approve incoming submissions.

## Health verification

Use:

```text
GET /api/health
```

Expected JSON:

```json
{
  "data": {
    "status": "ok",
    "timestamp": "2026-03-19T00:00:00.000Z",
    "services": {
      "database": "connected"
    }
  }
}
```
