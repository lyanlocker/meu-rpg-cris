import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { insertDiceRollSchema, type UpdateCharacterRequest } from "@shared/schema";
import {
  CHARACTER_CLASSES,
  getClassInitialStats,
  getClassLevelGains,
  getExpectedPdAtNex,
  getNexAbilities,
  getNexLevel,
  getNextNex,
  getPdLimit,
  isCharacterClass,
} from "@shared/nex";
import { z } from "zod";

const MASTER_PROTECTED_FIELDS = ["nex", "characterClass", "peMax", "peLimit"] as const;
const classUpdateSchema = z.object({
  characterClass: z.enum(CHARACTER_CLASSES),
  recalculateInitial: z.boolean().optional().default(false),
});
const imageKindSchema = z.enum(["normal", "mask"]);
const imageUploadSchema = z.object({
  dataUrl: z.string().min(1).max(2_500_000),
});
const paranormalItemIdSchema = z.string().min(1).max(64).regex(/^[A-Za-z0-9_-]+$/);
const IMAGE_DATA_URL = /^data:(image\/(?:webp|png|jpeg));base64,([A-Za-z0-9+/=]+)$/;
const MAX_STORED_IMAGE_BYTES = 1_500_000;

interface ParanormalItemRecord {
  id: string;
  name: string;
  element: string;
  description: string;
  imageUrl?: string;
}

function applyAttributeDerivedStats(
  current: NonNullable<Awaited<ReturnType<typeof storage.getCharacter>>>,
  input: UpdateCharacterRequest,
  rawBody: unknown,
): UpdateCharacterRequest {
  const updates: UpdateCharacterRequest = { ...input };
  const body = rawBody && typeof rawBody === "object" ? rawBody as Record<string, unknown> : {};
  const levelMultiplier = Math.max(1, getNexLevel(current.nex));

  if (typeof input.attVig === "number" && input.attVig !== current.attVig) {
    const pvDelta = (input.attVig - current.attVig) * levelMultiplier;
    const nextPvMax = Math.max(0, current.pvMax + pvDelta);

    if (!Object.prototype.hasOwnProperty.call(body, "pvMax")) {
      updates.pvMax = nextPvMax;
    }
    if (!Object.prototype.hasOwnProperty.call(body, "pvActual")) {
      updates.pvActual = Math.min(nextPvMax, Math.max(0, current.pvActual + pvDelta));
    }
  }

  if (typeof input.attPre === "number" && input.attPre !== current.attPre) {
    const pdDelta = (input.attPre - current.attPre) * levelMultiplier;
    const nextPdMax = Math.max(0, current.pdMax + pdDelta);

    if (!Object.prototype.hasOwnProperty.call(body, "pdMax")) {
      updates.pdMax = nextPdMax;
    }
    if (!Object.prototype.hasOwnProperty.call(body, "pdActual")) {
      updates.pdActual = Math.min(nextPdMax, Math.max(0, current.pdActual + pdDelta));
    }
  }

  return updates;
}

function getImageField(kind: "normal" | "mask"): "imageUrl" | "maskImageUrl" {
  return kind === "mask" ? "maskImageUrl" : "imageUrl";
}

function getParanormalItems(value: unknown): ParanormalItemRecord[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is ParanormalItemRecord => (
    Boolean(item)
    && typeof item === "object"
    && typeof (item as ParanormalItemRecord).id === "string"
  ));
}

function getParanormalItemImageKind(itemId: string): string {
  return `paranormal-item:${itemId}`;
}

function rejectPlayerWrite(req: Request, res: Response): boolean {
  if (req.header("x-cris-mode") !== "player") return false;
  res.status(403).json({ message: "Itens paranormais só podem ser alterados pelo mestre." });
  return true;
}

function sendStoredImage(res: Response, image: NonNullable<Awaited<ReturnType<typeof storage.getCharacterImage>>>) {
  const data = Buffer.from(image.dataBase64, "base64");
  res.set({
    "Content-Type": image.mimeType,
    "Content-Length": data.length.toString(),
    "Cache-Control": "public, max-age=31536000, immutable",
    "Last-Modified": image.updatedAt.toUTCString(),
    "X-Content-Type-Options": "nosniff",
  });
  return res.send(data);
}

function parseStoredImage(dataUrl: string): { mimeType: string; dataBase64: string } {
  const match = IMAGE_DATA_URL.exec(dataUrl);
  if (!match) {
    throw new Error("Formato de imagem inválido. Use PNG, JPG ou WebP.");
  }

  const [, mimeType, dataBase64] = match;
  const decodedSize = Buffer.from(dataBase64, "base64").length;
  if (decodedSize <= 0 || decodedSize > MAX_STORED_IMAGE_BYTES) {
    throw new Error("A imagem compactada deve possuir no máximo 1,5 MB.");
  }

  return { mimeType, dataBase64 };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.characters.list.path, async (_req, res) => {
    const chars = await storage.getCharacters();
    res.json(chars);
  });

  app.get(api.characters.get.path, async (req, res) => {
    const char = await storage.getCharacter(req.params.id);
    if (!char) {
      return res.status(404).json({ message: "Character not found" });
    }
    res.json(char);
  });

  app.post(api.characters.create.path, async (req, res) => {
    try {
      const input = api.characters.create.input.parse(req.body);
      const characterClass = isCharacterClass(input.characterClass) ? input.characterClass : "combatente";
      const initialStats = getClassInitialStats(characterClass, input.attVig ?? 1, input.attPre ?? 1);
      const char = await storage.createCharacter({
        ...input,
        characterClass,
        nex: 5,
        pvActual: initialStats.pv,
        pvMax: initialStats.pv,
        pdActual: initialStats.pd,
        pdMax: initialStats.pd,
        peActual: 0,
        peMax: 0,
        peLimit: 1,
      });
      res.status(201).json(char);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      throw err;
    }
  });

  app.patch(api.characters.update.path, async (req, res) => {
    try {
      const containsMasterField = MASTER_PROTECTED_FIELDS.some((field) =>
        Object.prototype.hasOwnProperty.call(req.body, field)
      );
      if (containsMasterField) {
        return res.status(403).json({
          message: "NEX, classe e limite de PD só podem ser alterados pelo painel do mestre.",
        });
      }

      const input = api.characters.update.input.parse(req.body);
      const current = await storage.getCharacter(req.params.id);
      if (!current) {
        return res.status(404).json({ message: "Character not found" });
      }

      const updates = applyAttributeDerivedStats(current, input, req.body);
      const char = await storage.updateCharacter(req.params.id, updates);
      res.json(char);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      throw err;
    }
  });

  app.get("/api/characters/:id/image/:kind", async (req, res) => {
    const kindResult = imageKindSchema.safeParse(req.params.kind);
    if (!kindResult.success) {
      return res.status(400).json({ message: "Tipo de retrato inválido." });
    }

    const image = await storage.getCharacterImage(req.params.id, kindResult.data);
    if (!image) {
      return res.status(404).json({ message: "Retrato não encontrado." });
    }

    return sendStoredImage(res, image);
  });

  app.post("/api/characters/:id/image/:kind", async (req, res) => {
    try {
      const kind = imageKindSchema.parse(req.params.kind);
      const { dataUrl } = imageUploadSchema.parse(req.body);
      const character = await storage.getCharacter(req.params.id);
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }

      const { mimeType, dataBase64 } = parseStoredImage(dataUrl);
      const image = await storage.upsertCharacterImage({
        characterId: character.id,
        kind,
        mimeType,
        dataBase64,
      });
      const internalUrl = `/api/characters/${character.id}/image/${kind}?v=${image.updatedAt.getTime()}`;
      const updated = await storage.updateCharacter(character.id, {
        [getImageField(kind)]: internalUrl,
      });

      return res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0]?.message ?? "Upload inválido." });
      }
      if (err instanceof Error) {
        return res.status(400).json({ message: err.message });
      }
      throw err;
    }
  });

  app.delete("/api/characters/:id/image/:kind", async (req, res) => {
    try {
      const kind = imageKindSchema.parse(req.params.kind);
      const character = await storage.getCharacter(req.params.id);
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }

      await storage.deleteCharacterImage(character.id, kind);
      const updated = await storage.updateCharacter(character.id, {
        [getImageField(kind)]: "",
      });
      return res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Tipo de retrato inválido." });
      }
      throw err;
    }
  });

  app.get("/api/characters/:id/paranormal-items/:itemId/image", async (req, res) => {
    const itemIdResult = paranormalItemIdSchema.safeParse(req.params.itemId);
    if (!itemIdResult.success) {
      return res.status(400).json({ message: "Identificador de item inválido." });
    }

    const image = await storage.getCharacterImage(
      req.params.id,
      getParanormalItemImageKind(itemIdResult.data),
    );
    if (!image) {
      return res.status(404).json({ message: "Imagem do item não encontrada." });
    }

    return sendStoredImage(res, image);
  });

  app.post("/api/characters/:id/paranormal-items/:itemId/image", async (req, res) => {
    if (rejectPlayerWrite(req, res)) return;

    try {
      const itemId = paranormalItemIdSchema.parse(req.params.itemId);
      const { dataUrl } = imageUploadSchema.parse(req.body);
      const character = await storage.getCharacter(req.params.id);
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }

      const items = getParanormalItems(character.paranormalItems);
      if (!items.some((item) => item.id === itemId)) {
        return res.status(404).json({ message: "Item paranormal não encontrado na ficha." });
      }

      const { mimeType, dataBase64 } = parseStoredImage(dataUrl);
      const image = await storage.upsertCharacterImage({
        characterId: character.id,
        kind: getParanormalItemImageKind(itemId),
        mimeType,
        dataBase64,
      });
      const internalUrl = `/api/characters/${character.id}/paranormal-items/${itemId}/image?v=${image.updatedAt.getTime()}`;
      const nextItems = items.map((item) => item.id === itemId ? { ...item, imageUrl: internalUrl } : item);
      const updated = await storage.updateCharacter(character.id, { paranormalItems: nextItems });

      return res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0]?.message ?? "Upload inválido." });
      }
      if (err instanceof Error) {
        return res.status(400).json({ message: err.message });
      }
      throw err;
    }
  });

  app.delete("/api/characters/:id/paranormal-items/:itemId", async (req, res) => {
    if (rejectPlayerWrite(req, res)) return;

    try {
      const itemId = paranormalItemIdSchema.parse(req.params.itemId);
      const character = await storage.getCharacter(req.params.id);
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }

      const items = getParanormalItems(character.paranormalItems);
      if (!items.some((item) => item.id === itemId)) {
        return res.status(404).json({ message: "Item paranormal não encontrado na ficha." });
      }

      await storage.deleteCharacterImage(character.id, getParanormalItemImageKind(itemId));
      const updated = await storage.updateCharacter(character.id, {
        paranormalItems: items.filter((item) => item.id !== itemId),
      });
      return res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Identificador de item inválido." });
      }
      throw err;
    }
  });

  app.post("/api/characters/:id/class", async (req, res) => {
    try {
      const input = classUpdateSchema.parse(req.body);
      const current = await storage.getCharacter(req.params.id);
      if (!current) {
        return res.status(404).json({ message: "Character not found" });
      }

      const updates: UpdateCharacterRequest = {
        characterClass: input.characterClass,
      };

      if (input.recalculateInitial && current.nex === 5) {
        const initialStats = getClassInitialStats(input.characterClass, current.attVig, current.attPre);
        Object.assign(updates, {
          pvActual: initialStats.pv,
          pvMax: initialStats.pv,
          pdActual: initialStats.pd,
          pdMax: initialStats.pd,
          peActual: 0,
          peMax: 0,
          peLimit: 1,
        });
      }

      const char = await storage.updateCharacter(req.params.id, updates);
      res.json(char);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.post("/api/characters/:id/advance-nex", async (req, res) => {
    const char = await storage.getCharacter(req.params.id);
    if (!char) {
      return res.status(404).json({ message: "Character not found" });
    }

    const nextNex = getNextNex(char.nex);
    if (nextNex === null) {
      return res.status(400).json({ message: "O agente já atingiu NEX 99%." });
    }

    const characterClass = isCharacterClass(char.characterClass) ? char.characterClass : "combatente";
    const gains = getClassLevelGains(characterClass, char.attVig, char.attPre);
    const pdLimit = getPdLimit(nextNex);
    const expectedCurrentPdMax = getExpectedPdAtNex(characterClass, char.nex, char.attPre);
    const basePdMax = char.pdMax > 0 ? char.pdMax : expectedCurrentPdMax;
    const basePdActual = char.pdMax > 0 ? char.pdActual : expectedCurrentPdMax;

    const updated = await storage.updateCharacter(char.id, {
      nex: nextNex,
      pvActual: char.pvActual + gains.pv,
      pvMax: char.pvMax + gains.pv,
      pdActual: basePdActual + gains.pd,
      pdMax: basePdMax + gains.pd,
      peLimit: pdLimit,
    });

    res.json({
      character: updated,
      advancement: {
        fromNex: char.nex,
        toNex: nextNex,
        level: getNexLevel(nextNex),
        pdLimit,
        gains,
        abilities: getNexAbilities(characterClass, nextNex),
      },
    });
  });

  app.delete(api.characters.delete.path, async (req, res) => {
    await storage.deleteCharacter(req.params.id);
    res.status(204).end();
  });

  app.get("/api/dice-rolls", async (_req, res) => {
    const rolls = await storage.getDiceRolls(50);
    res.json(rolls);
  });

  app.post("/api/dice-rolls", async (req, res) => {
    try {
      const input = insertDiceRollSchema.parse(req.body);
      const roll = await storage.logDiceRoll(input);
      res.status(201).json(roll);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  return httpServer;
}
