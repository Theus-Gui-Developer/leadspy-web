import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import { timestamps } from "./common"
import { users } from "./users"

export const savedAdFolders = pgTable(
  "saved_ad_folders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull(),
    position: integer("position").notNull().default(0),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("saved_ad_folders_user_slug_unique").on(
      table.userId,
      table.slug,
    ),
    index("saved_ad_folders_user_id_idx").on(table.userId),
  ],
)

export const savedAds = pgTable(
  "saved_ads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    folderId: uuid("folder_id").references(() => savedAdFolders.id, {
      onDelete: "set null",
    }),

    adId: varchar("ad_id", { length: 32 }).notNull(),
    libraryUrl: varchar("library_url", { length: 512 }),
    advertiserName: varchar("advertiser_name", { length: 255 }),
    advertiserLink: varchar("advertiser_link", { length: 512 }),
    pageId: varchar("page_id", { length: 64 }),
    adText: text("ad_text"),
    siteUrl: varchar("site_url", { length: 512 }),
    domain: varchar("domain", { length: 255 }),
    mediaType: varchar("media_type", { length: 32 }),
    thumbnailUrl: varchar("thumbnail_url", { length: 1024 }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),

    shareToken: varchar("share_token", { length: 32 }).unique(),

    savedAt: timestamp("saved_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("saved_ads_user_ad_unique").on(table.userId, table.adId),
    index("saved_ads_user_id_idx").on(table.userId),
    index("saved_ads_folder_id_idx").on(table.folderId),
    index("saved_ads_domain_idx").on(table.userId, table.domain),
    index("saved_ads_share_token_idx").on(table.shareToken),
  ],
)
