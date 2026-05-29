import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const matchStatus = pgEnum('match_status', [
  'scheduled',
  'live',
  'finished',
]);

export const matches = pgTable(
  'matches',
  {
    id: serial('id').primaryKey(),
    sport: text('sport').notNull(),
    homeTeam: text('home_team').notNull(),
    awayTeam: text('away_team').notNull(),
    status: matchStatus('status').notNull().default('scheduled'),
    startTime: timestamp('start_time', { withTimezone: true }).notNull(),
    endTime: timestamp('end_time', { withTimezone: true }),
    homeScore: integer('home_score').notNull().default(0),
    awayScore: integer('away_score').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('matches_status_start_time_idx').on(table.status, table.startTime),
    index('matches_sport_idx').on(table.sport),
  ]
);

export const commentary = pgTable(
  'commentary',
  {
    id: serial('id').primaryKey(),
    matchId: integer('match_id')
      .notNull()
      .references(() => matches.id, { onDelete: 'cascade' }),
    minute: integer('minute'),
    sequence: integer('sequence').notNull(),
    period: text('period'),
    eventType: text('event_type').notNull(),
    actor: text('actor'),
    team: text('team'),
    message: text('message').notNull(),
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),
    tags: text('tags').array(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('commentary_match_sequence_idx').on(
      table.matchId,
      table.sequence
    ),
    index('commentary_match_created_at_idx').on(table.matchId, table.createdAt),
  ]
);

export type MatchStatus = (typeof matchStatus.enumValues)[number];

export type Match = typeof matches.$inferSelect;
export type NewMatch = typeof matches.$inferInsert;

export type Commentary = typeof commentary.$inferSelect;
export type NewCommentary = typeof commentary.$inferInsert;
