export const queryKeys = {
  session: ["session"] as const,
  products: (filters: object = {}) => ["products", filters] as const,
  product: (id: string) => ["product", id] as const,
  history: (id: string) => ["history", id] as const,
  verifications: (id: string) => ["verifications", id] as const,
  alerts: (filters: object = {}) => ["alerts", filters] as const,
  alert: (id: string) => ["alert", id] as const,
  mockOffers: ["mock-offers"] as const,
  outbox: (filters: object = {}) => ["outbox", filters] as const,
};
