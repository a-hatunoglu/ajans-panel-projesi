-- DropIndex
DROP INDEX "company_users_company_id_role_idx";

-- CreateTable
CREATE TABLE "company_user_roles" (
    "id" UUID NOT NULL,
    "company_user_id" UUID NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "assigned_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "company_user_roles_company_user_id_idx" ON "company_user_roles"("company_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "company_user_roles_company_user_id_role_key" ON "company_user_roles"("company_user_id", "role");

-- AddForeignKey
ALTER TABLE "company_user_roles" ADD CONSTRAINT "company_user_roles_company_user_id_fkey" FOREIGN KEY ("company_user_id") REFERENCES "company_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_user_roles" ADD CONSTRAINT "company_user_roles_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
