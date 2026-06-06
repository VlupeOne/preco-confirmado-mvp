import type { components } from "@/lib/api/generated/schema";

export type ApiSchemas = components["schemas"];
export type AuthTokens = ApiSchemas["AuthResponse"];
export type SessionUser = ApiSchemas["UserResponse"];
export type Product = ApiSchemas["TrackedProductResponse"];
export type ProductInput = ApiSchemas["TrackedProductRequest"];
export type PriceSnapshot = ApiSchemas["PriceSnapshotResponse"];
export type Verification = ApiSchemas["VerificationResponse"];
export type Alert = ApiSchemas["AlertResponse"];
export type MockOffer = ApiSchemas["MockOfferResponse"];
export type MockOfferInput = ApiSchemas["MockOfferRequest"];
export type OutboxItem = ApiSchemas["OutboxResponse"];
export type PageMetadata = ApiSchemas["PageMetadata"];

export type ApiPage<T> = {
  content?: T[];
  page?: PageMetadata;
};
