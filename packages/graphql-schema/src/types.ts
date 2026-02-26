// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

export const GQL_SCALARS = ['DateTime', 'JSON', 'UUID', 'BigInt'] as const;
export type GQLScalar = typeof GQL_SCALARS[number];

export const GQL_DIRECTIVES = ['@auth', '@deprecated', '@paginated', '@cached'] as const;
export type GQLDirective = typeof GQL_DIRECTIVES[number];

export type SortOrder = 'ASC' | 'DESC';

// ── Core entity type strings ────────────────────────────────────────────────

export const NCR_TYPE = `
  type NCR {
    id: UUID!
    title: String!
    description: String
    status: String!
    severity: String!
    detectedAt: DateTime!
    closedAt: DateTime
    assignedTo: String
    organisationId: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }
`;

export const CAPA_TYPE = `
  type CAPA {
    id: UUID!
    title: String!
    description: String
    type: String!
    status: String!
    dueDate: DateTime!
    completedAt: DateTime
    assignedTo: String!
    rootCause: String
    organisationId: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }
`;

export const INCIDENT_TYPE = `
  type Incident {
    id: UUID!
    title: String!
    dateOccurred: DateTime!
    severity: String!
    status: String!
    location: String
    description: String
    assignedTo: String
    organisationId: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }
`;

export const RISK_TYPE = `
  type Risk {
    id: UUID!
    title: String!
    description: String
    category: String!
    likelihood: Int!
    severity: Int!
    riskScore: Int!
    status: String!
    owner: String
    reviewDate: DateTime
    organisationId: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }
`;

export const DOCUMENT_TYPE = `
  type Document {
    id: UUID!
    title: String!
    category: String!
    status: String!
    version: String!
    expiresAt: DateTime
    ownerId: String!
    organisationId: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }
`;

export const USER_TYPE = `
  type User {
    id: UUID!
    email: String!
    firstName: String!
    lastName: String!
    role: String!
    organisationId: String!
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }
`;

export const ORGANISATION_TYPE = `
  type Organisation {
    id: UUID!
    name: String!
    slug: String!
    plan: String!
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }
`;

// ── Pagination types ─────────────────────────────────────────────────────────

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
  totalCount: number;
}

export interface Edge<T> {
  node: T;
  cursor: string;
}

export interface Connection<T> {
  edges: Edge<T>[];
  pageInfo: PageInfo;
  totalCount: number;
}

// ── Filter types ─────────────────────────────────────────────────────────────

export interface DateFilter {
  eq?: Date;
  neq?: Date;
  gt?: Date;
  gte?: Date;
  lt?: Date;
  lte?: Date;
  between?: [Date, Date];
}

export interface StringFilter {
  eq?: string;
  neq?: string;
  contains?: string;
  startsWith?: string;
  endsWith?: string;
  in?: string[];
  notIn?: string[];
}

export interface NumberFilter {
  eq?: number;
  neq?: number;
  gt?: number;
  gte?: number;
  lt?: number;
  lte?: number;
  between?: [number, number];
}
