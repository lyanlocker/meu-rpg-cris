export type PanaceaRitualElement = "conhecimento" | "energia" | "sangue" | "morte";

export interface PanaceaRitual {
  id: string;
  number: number;
  name: string;
  element: PanaceaRitualElement;
  circle: number;
  base: string;
  discente: string;
  verdadeiro: string;
  application: string;
}
