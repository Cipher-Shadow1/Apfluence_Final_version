import type { Roles } from "@clerk/types";

export {};

declare global {
  interface CustomJwtSessionClaims {
    publicMetadata?: {
      role?: "brand" | "influencer";
    };
  }
}
