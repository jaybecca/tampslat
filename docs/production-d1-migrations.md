# Applying TAMPslat production D1 migrations

The Worker and the production D1 database must be upgraded together. A Cloudflare Worker deployment does **not** automatically apply files in `backend/migrations/`. The CI migration-chain test validates the SQL locally; it does not change the production database.

When a release adds a new migration:

1. From the repository root, authenticate Wrangler if this machine is not already connected:

   ```bash
   npx wrangler login
   ```

2. Check the remote migration state:

   ```bash
   npx wrangler d1 migrations list tampslat-db --remote
   ```

3. Apply all pending migrations to the production database **before** deploying the Worker:

   ```bash
   npx wrangler d1 migrations apply tampslat-db --remote
   ```

4. Check the migration list again. Confirm the new migration appears as applied, then allow the normal GitHub-to-Cloudflare deployment to publish the Worker.

Do not manually repeat SQL that is already recorded in `d1_migrations`. Do not run migrations against `tampslat-preview-db` when preparing production.

## Production repair performed 2026-11-06

The live `tampslat-db` database had only `0001_init.sql` recorded. Migrations `0002_billing.sql`, `0003_usage_tracking.sql`, `0004_annual_billing.sql`, `0005_per_tool_usage.sql`, and `0006_usage_account_counters.sql` were applied in order and recorded in `d1_migrations`. The production `users` table now includes the billing columns expected by the Worker, and the usage and tool-usage tables exist.
