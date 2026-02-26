// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { registerConnector } from '@ims/sync-engine';
import { createXeroConnector } from './connector';

registerConnector('XERO', createXeroConnector);

export { XeroConnector, createXeroConnector } from './connector';
