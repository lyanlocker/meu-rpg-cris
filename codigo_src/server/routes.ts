import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { timingSafeEqual } from "crypto";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { insertDiceRollSchema } from "@shared/schema";
import {
  CHARACTER_CLASSES,
  getClassInitialStats,
  getClassLevelGains,
  getNexAbilities,
  getNexLevel,
  getNextNex,
  getPeLimit,
  isCharacterClass,
} from "@shared/nex";
import { z } from "zod";

const MASTER_PROTECTED_FIELDS = ["nex", "characterClass", "peMax", "peLimit"] as const;
const classUpdateSchema = z.object({ characterClass: z.enum(CHARACTER_CLASSES) });

function hasValidMasterKey(req: Request, res: Response): boolean {
  const configuredKey = process.env.MASTER_KEY;
  if (!configuredKey) {
    res.status(503).json({
      message: "MASTER_KEY não configurada no servidor. Defina a variável antes de usar a progressão de NEX.",
    });
    return false;
  }

  const suppliedKey = req.header("x-master-key") ?? "";
  const expected = Buffer.from(configuredKey);
  const supplied = Buffer.from(suppliedKey);
  const isValid = supplied.length === expected.length && timingSafeEqual(supplied, expected);

  if (!isValid) {
    res.status(403).json({ message: "Código do mestre inválido." });
    return false;
  }

  return true;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.characters.list.path, async (req, res) => {
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
        peActual: initialStats.pe,
        peMax: initialStats.pe,
        peLimit: 1,
        pdActual: initialStats.san,
        pdMax: initialStats.san,
      });
      res.status(201).json(char);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
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
          message: "NEX, classe e limites de progressão só podem ser alterados pelo painel do mestre.",
        });
      }

      const input = api.characters.update.input.parse(req.body);
      const char = await storage.updateCharacter(req.params.id, input);
      if (!char) {
        return res.status(404).json({ message: "Character not found" });
      }
      res.json(char);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.post("/api/characters/:id/class", async (req, res) => {
    if (!hasValidMasterKey(req, res)) return;

    try {
      const input = classUpdateSchema.parse(req.body);
      const char = await storage.updateCharacter(req.params.id, {
        characterClass: input.characterClass,
      });
      if (!char) {
        return res.status(404).json({ message: "Character not found" });
      }
      res.json(char);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.post("/api/characters/:id/advance-nex", async (req, res) => {
    if (!hasValidMasterKey(req, res)) return;

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
    const peLimit = getPeLimit(nextNex);
    const updated = await storage.updateCharacter(char.id, {
      nex: nextNex,
      pvActual: char.pvActual + gains.pv,
      pvMax: char.pvMax + gains.pv,
      peActual: char.peActual + gains.pe,
      peMax: char.peMax + gains.pe,
      peLimit,
      pdActual: char.pdActual + gains.san,
      pdMax: char.pdMax + gains.san,
    });

    res.json({
      character: updated,
      advancement: {
        fromNex: char.nex,
        toNex: nextNex,
        level: getNexLevel(nextNex),
        peLimit,
        gains,
        abilities: getNexAbilities(characterClass, nextNex),
      },
    });
  });

  app.delete(api.characters.delete.path, async (req, res) => {
    await storage.deleteCharacter(req.params.id);
    res.status(204).end();
  });

  // Dice rolls monitoring
  app.get("/api/dice-rolls", async (req, res) => {
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
