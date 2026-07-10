ALTER TABLE "settings" ALTER COLUMN "social" SET DEFAULT '{"instagram":"","facebook":"","tiktok":"","youtube":"","twitter":""}'::jsonb;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "logo_url" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "logo_key" text DEFAULT '' NOT NULL;