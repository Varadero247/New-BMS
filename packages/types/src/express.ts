// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import type { Request, Response, NextFunction } from 'express';

export interface TypedRequest<
  TBody = unknown,
  TParams extends Record<string, string> = Record<string, string>,
  TQuery = Record<string, string | string[] | undefined>,
> extends Request<TParams, unknown, TBody, TQuery & Record<string, unknown>> {
  body: TBody;
}

export interface AuthenticatedRequest<
  TBody = unknown,
  TParams extends Record<string, string> = Record<string, string>,
  TQuery = Record<string, string | string[] | undefined>,
> extends TypedRequest<TBody, TParams, TQuery> {
  user?: {
    id: string;
    email: string;
    role: string;
    permissions?: string[];
  };
}

export type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;
