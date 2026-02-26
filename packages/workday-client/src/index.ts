// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { registerConnector } from '@ims/sync-engine';
import { createWorkdayConnector } from './connector';

registerConnector('WORKDAY', createWorkdayConnector);

export { WorkdayConnector, createWorkdayConnector } from './connector';
