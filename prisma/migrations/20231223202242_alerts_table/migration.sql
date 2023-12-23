-- CreateEnum
CREATE TYPE "AlertMetric" AS ENUM ('COST_PER_USER');

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "alert_metric" "AlertMetric" NOT NULL,
    "alert_threshold" DOUBLE PRECISION NOT NULL,
    "trigger_webhook_url" TEXT,
    "project_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "alerts_project_id_idx" ON "alerts" USING HASH ("project_id");

-- CreateIndex
CREATE INDEX "alerts_alert_threshold_idx" ON "alerts"("alert_threshold");

-- CreateIndex
CREATE UNIQUE INDEX "alerts_project_id_name_key" ON "alerts"("project_id", "name");

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

