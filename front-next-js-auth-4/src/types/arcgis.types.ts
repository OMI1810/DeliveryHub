export interface IAddressSuggestion {
  text: string;
  magicKey: string;
}

export interface IGeoResult {
  lat: number;
  lon: number;
  displayName: string;
  score: number;
}
