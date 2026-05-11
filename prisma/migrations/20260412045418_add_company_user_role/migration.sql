-- AlterTable
ALTER TABLE "company_users" ADD COLUMN     "role" VARCHAR(20);

-- CreateIndex
CREATE INDEX "company_users_company_id_role_idx" ON "company_users"("company_id", "role");
