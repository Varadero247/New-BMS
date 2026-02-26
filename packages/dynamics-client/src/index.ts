// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { registerConnector } from '@ims/sync-engine';
import { createDynamics365Connector } from './connector';

registerConnector('DYNAMICS_365', createDynamics365Connector);

export { Dynamics365Connector, createDynamics365Connector } from './connector';
