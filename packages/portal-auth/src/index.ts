// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
export {
  signPortalToken,
  verifyPortalToken,
  portalAuthenticate,
  requirePortalPermission,
  requirePortalType,
} from './portal-jwt';
export type {
  PortalUser,
  PortalToken,
  PortalType,
  PortalAuthConfig,
  PortalRequest,
  PortalResponse,
  NextFunction,
} from './types';
