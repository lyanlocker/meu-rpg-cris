import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { Character, InsertCharacter, UpdateCharacterRequest } from "@shared/schema";

interface QueuedCharacterUpdate {
  character: Character;
  revision: number;
}

const characterUpdateQueues = new Map<string, Promise<unknown>>();
const characterUpdateRevisions = new Map<string, number>();

function getCrisAccessMode(): "master" | "player" {
  if (typeof window === "undefined") return "master";
  return new URLSearchParams(window.location.search).get("mode") === "player"
    ? "player"
    : "master";
}

function enqueueCharacterUpdate(id: string, task: () => Promise<Character>): Promise<QueuedCharacterUpdate> {
  const revision = (characterUpdateRevisions.get(id) ?? 0) + 1;
  characterUpdateRevisions.set(id, revision);

  const previous = characterUpdateQueues.get(id) ?? Promise.resolve();
  const current = previous
    .catch(() => undefined)
    .then(task)
    .then((character) => ({ character, revision }));

  characterUpdateQueues.set(id, current);
  void current.finally(() => {
    if (characterUpdateQueues.get(id) === current) {
      characterUpdateQueues.delete(id);
    }
  }).catch(() => undefined);

  return current;
}

export function useCharacters() {
  return useQuery({
    queryKey: [api.characters.list.path],
    queryFn: async () => {
      const res = await fetch(api.characters.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch characters");
      const data = await res.json();
      return api.characters.list.responses[200].parse(data);
    },
  });
}

export function useCharacter(id: string) {
  return useQuery({
    queryKey: [api.characters.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.characters.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch character");
      const data = await res.json();
      return api.characters.get.responses[200].parse(data);
    },
    enabled: !!id,
  });
}

export function useCreateCharacter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (character: InsertCharacter) => {
      const res = await fetch(api.characters.create.path, {
        method: api.characters.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(character),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create character");
      const data = await res.json();
      return api.characters.create.responses[201].parse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.characters.list.path] });
    },
  });
}

export function useUpdateCharacter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateCharacterRequest }) =>
      enqueueCharacterUpdate(id, async () => {
        const url = buildUrl(api.characters.update.path, { id });
        const res = await fetch(url, {
          method: api.characters.update.method,
          headers: {
            "Content-Type": "application/json",
            "X-CRIS-Mode": getCrisAccessMode(),
          },
          body: JSON.stringify(updates),
          credentials: "include",
        });
        if (!res.ok) {
          const payload = await res.json().catch(() => null);
          throw new Error(payload?.message || "Failed to update character");
        }
        const data = await res.json();
        return api.characters.update.responses[200].parse(data);
      }),
    onSuccess: ({ character, revision }, variables) => {
      const isLatestRevision = characterUpdateRevisions.get(variables.id) === revision;
      if (!isLatestRevision) return;

      queryClient.setQueryData([api.characters.get.path, character.id], character);
      queryClient.invalidateQueries({ queryKey: [api.characters.list.path] });
    },
    onError: (_error, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.characters.get.path, variables.id] });
      queryClient.invalidateQueries({ queryKey: [api.characters.list.path] });
    },
  });
}

export function useDeleteCharacter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const url = buildUrl(api.characters.delete.path, { id });
      const res = await fetch(url, {
        method: api.characters.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete character");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.characters.list.path] });
    },
  });
}
