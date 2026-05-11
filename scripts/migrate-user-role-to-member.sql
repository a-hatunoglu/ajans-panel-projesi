-- S-01: Rename UserRole 'user' → 'member'
-- Run this against the production database BEFORE deploying the new backend code.
-- Safe to run multiple times (idempotent — the WHERE clause prevents no-ops).

UPDATE users SET role = 'member' WHERE role = 'user';

-- Verify
SELECT role, COUNT(*) FROM users GROUP BY role ORDER BY role;
