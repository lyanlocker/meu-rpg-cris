import { db } from "./db";
import {
  characters,
  diceRolls,
  type Character,
  type InsertCharacter,
  type UpdateCharacterRequest,
  type InsertDiceRoll,
  type DiceRollRecord,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { randomBytes } from "crypto";

export interface IStorage {
  getCharacters(): Promise<Character[]>;
  getCharacter(id: string): Promise<Character | undefined>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  updateCharacter(id: string, updates: UpdateCharacterRequest): Promise<Character | undefined>;
  deleteCharacter(id: string): Promise<void>;
  logDiceRoll(roll: InsertDiceRoll): Promise<DiceRollRecord>;
  getDiceRolls(limit?: number): Promise<DiceRollRecord[]>;
}

export class DatabaseStorage implements IStorage {
  async getCharacters(): Promise<Character[]> {
    return await db.select().from(characters);
  }

  async getCharacter(id: string): Promise<Character | undefined> {
    const [char] = await db.select().from(characters).where(eq(characters.id, id));
    return char;
  }

  async createCharacter(character: InsertCharacter): Promise<Character> {
    const id = randomBytes(4).toString('hex');
    const [created] = await db.insert(characters).values({ ...character, id }).returning();
    return created;
  }

  async updateCharacter(id: string, updates: UpdateCharacterRequest): Promise<Character | undefined> {
    const [updated] = await db.update(characters)
      .set(updates)
      .where(eq(characters.id, id))
      .returning();
    return updated;
  }

  async deleteCharacter(id: string): Promise<void> {
    await db.delete(characters).where(eq(characters.id, id));
  }

  async logDiceRoll(roll: InsertDiceRoll): Promise<DiceRollRecord> {
    const [created] = await db.insert(diceRolls).values(roll).returning();
    return created;
  }

  async getDiceRolls(limit = 50): Promise<DiceRollRecord[]> {
    return await db.select().from(diceRolls).orderBy(desc(diceRolls.rolledAt)).limit(limit);
  }
}

export const storage = new DatabaseStorage();
