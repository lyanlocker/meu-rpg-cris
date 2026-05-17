import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { insertDiceRollSchema } from "@shared/schema";
import { z } from "zod";

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
      const char = await storage.createCharacter(input);
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
