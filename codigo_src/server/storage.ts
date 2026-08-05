import { db } from "./db";
import {
  characters,
  characterImages,
  diceRolls,
  type Character,
  type CharacterImage,
  type InsertCharacter,
  type UpdateCharacterRequest,
  type InsertDiceRoll,
  type DiceRollRecord,
} from "@shared/schema";
import { and, desc, eq } from "drizzle-orm";
import { randomBytes } from "crypto";

export interface IStorage {
  getCharacters(): Promise<Character[]>;
  getCharacter(id: string): Promise<Character | undefined>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  updateCharacter(id: string, updates: UpdateCharacterRequest): Promise<Character | undefined>;
  deleteCharacter(id: string): Promise<void>;
  getCharacterImage(characterId: string, kind: string): Promise<CharacterImage | undefined>;
  upsertCharacterImage(input: {
    characterId: string;
    kind: string;
    mimeType: string;
    dataBase64: string;
  }): Promise<CharacterImage>;
  deleteCharacterImage(characterId: string, kind: string): Promise<void>;
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
    const id = randomBytes(4).toString("hex");
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

  async getCharacterImage(characterId: string, kind: string): Promise<CharacterImage | undefined> {
    const [image] = await db
      .select()
      .from(characterImages)
      .where(and(eq(characterImages.characterId, characterId), eq(characterImages.kind, kind)));
    return image;
  }

  async upsertCharacterImage(input: {
    characterId: string;
    kind: string;
    mimeType: string;
    dataBase64: string;
  }): Promise<CharacterImage> {
    const [image] = await db
      .insert(characterImages)
      .values(input)
      .onConflictDoUpdate({
        target: [characterImages.characterId, characterImages.kind],
        set: {
          mimeType: input.mimeType,
          dataBase64: input.dataBase64,
          updatedAt: new Date(),
        },
      })
      .returning();
    return image;
  }

  async deleteCharacterImage(characterId: string, kind: string): Promise<void> {
    await db
      .delete(characterImages)
      .where(and(eq(characterImages.characterId, characterId), eq(characterImages.kind, kind)));
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
