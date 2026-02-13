import type { Request, Response, NextFunction } from 'express';

export interface TypedRequest<TBody = unknown, TParams = Record<string, string>, TQuery = Record<string, string | undefined>> extends Request {
  body: TBody;
  params: TParams;
  query: TQuery;
}

export interface AuthenticatedRequest<TBody = unknown, TParams = Record<string, string>, TQuery = Record<string, string | undefined>> extends TypedRequest<TBody, TParams, TQuery> {
  user?: {
    id: string;
    email: string;
    role: string;
    permissions?: string[];
  };
}

export type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;
