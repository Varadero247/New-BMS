// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
// Minimal jsx-runtime mock for testing i18n modules
module.exports = {
  jsx: jest.fn().mockReturnValue(null),
  jsxs: jest.fn().mockReturnValue(null),
  Fragment: 'Fragment',
};
