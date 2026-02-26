// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
// Mock for @anthropic-ai/sdk used in tests

const Anthropic = jest.fn().mockImplementation(() => ({
  messages: {
    create: jest.fn().mockResolvedValue({
      id: 'msg_mock',
      type: 'message',
      role: 'assistant',
      content: [{ type: 'text', text: 'I can help you with that.' }],
      model: 'claude-sonnet-4-6',
      stop_reason: 'end_turn',
      usage: { input_tokens: 10, output_tokens: 20 },
    }),
  },
}));

module.exports = Anthropic;
module.exports.default = Anthropic;
