export type FormStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface UserDto {
  id: string;
  email: string;
  createdAt: string;
}

export interface ApiHealthResponse {
  status: "ok";
  service: "api";
  timestamp: string;
}
