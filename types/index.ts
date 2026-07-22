// Shared Types and Enums for Project LOOP (SQLite Compatibility)

export enum Role {
  ADMIN = "ADMIN",
  ANALYST = "ANALYST",
  VIEWER = "VIEWER"
}

export enum Channel {
  SUPPORT_TICKET = "SUPPORT_TICKET",
  APP_STORE = "APP_STORE",
  NPS_SURVEY = "NPS_SURVEY",
  SALES_CALL = "SALES_CALL",
  COMMUNITY = "COMMUNITY",
  OTHER = "OTHER"
}

export enum Sentiment {
  POSITIVE = "POSITIVE",
  NEUTRAL = "NEUTRAL",
  NEGATIVE = "NEGATIVE"
}

export enum Status {
  NEW = "NEW",
  REVIEWED = "REVIEWED",
  ACTIONED = "ACTIONED"
}
