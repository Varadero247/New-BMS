// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { registerConnector } from '@ims/sync-engine';
import { createBambooHRConnector } from './connector';

// Auto-register connector on import
registerConnector('BAMBOOHR', createBambooHRConnector);

export { BambooHRConnector, createBambooHRConnector } from './connector';
