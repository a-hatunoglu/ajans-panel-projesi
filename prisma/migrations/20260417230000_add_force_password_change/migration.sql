-- AlterTable
ALTER TABLE "users" ADD COLUMN "force_password_change" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "company_users" DROP COLUMN "role";
