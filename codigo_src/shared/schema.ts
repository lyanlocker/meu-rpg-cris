import { pgTable, text, integer, boolean, jsonb, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const characters = pgTable("characters", {
  id: text("id").primaryKey(), // We will use a unique string (e.g. nanoid) for shareable links
  name: text("name").notNull().default("Agente Desconhecido"),
  imageUrl: text("image_url").notNull().default(""),
  maskImageUrl: text("mask_image_url").notNull().default(""),
  pvActual: integer("pv_actual").notNull().default(0),
  pvMax: integer("pv_max").notNull().default(0),
  pdActual: integer("pd_actual").notNull().default(0),
  pdMax: integer("pd_max").notNull().default(0),
  defense: integer("defense").notNull().default(0),
  nex: integer("nex").notNull().default(0),
  appearance: text("appearance").notNull().default(""),
  
  // Atributos
  attAgi: integer("att_agi").notNull().default(1),
  attFor: integer("att_for").notNull().default(1),
  attInt: integer("att_int").notNull().default(1),
  attPre: integer("att_pre").notNull().default(1),
  attVig: integer("att_vig").notNull().default(1),
  
  resistances: text("resistances").notNull().default(""),
  
  // JSONB for flexible skills and powers
  skills: jsonb("skills").notNull().default({}), // Record<string, number>
  powers: jsonb("powers").notNull().default([]), // Array of { id: string, name: string, description: string } - Normal powers
  maskPowers: jsonb("mask_powers").notNull().default([]), // Array of { id: string, name: string, description: string } - Mask mode powers
  attacks: jsonb("attacks").notNull().default([]), // Array of { id, name, test, attackDice, damageDice } - Normal attacks
  maskAttacks: jsonb("mask_attacks").notNull().default([]), // Array of { id, name, test, attackDice, damageDice } - Mask attacks
  inventory: jsonb("inventory").notNull().default([]), // Array of { id, name, description, quantity }
  
  isMaskActive: boolean("is_mask_active").notNull().default(false),
  element: text("element").notNull().default(""), // "sangue" | "morte" | "conhecimento" | "energia" | ""
});

export const insertCharacterSchema = createInsertSchema(characters).omit({ id: true });

export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type Character = typeof characters.$inferSelect;
export type UpdateCharacterRequest = Partial<InsertCharacter>;

// Dice rolls log (for Master Shield monitoring)
export const diceRolls = pgTable("dice_rolls", {
  id: serial("id").primaryKey(),
  characterId: text("character_id").notNull(),
  characterName: text("character_name").notNull(),
  expression: text("expression").notNull(),
  results: jsonb("results").notNull().default([]), // number[]
  total: integer("total").notNull(),
  rolledAt: timestamp("rolled_at").notNull().defaultNow(),
});

export const insertDiceRollSchema = createInsertSchema(diceRolls).omit({ id: true });
export type InsertDiceRoll = z.infer<typeof insertDiceRollSchema>;
export type DiceRollRecord = typeof diceRolls.$inferSelect;
