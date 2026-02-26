// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { registerConnector } from '@ims/sync-engine';
import { createSAPConnector } from './connector';

registerConnector('SAP_HR', createSAPConnector);

export { SAPConnector, createSAPConnector } from './connector';
