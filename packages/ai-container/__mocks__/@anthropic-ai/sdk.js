const Anthropic = jest.fn().mockImplementation(() => ({
  messages: {
    create: jest.fn().mockResolvedValue({
      id: 'msg_mock_001',
      type: 'message',
      role: 'assistant',
      content: [{ type: 'text', text: '{"result": "mocked response", "confidence": 0.95}' }],
      model: 'claude-sonnet-4-20250514',
      stop_reason: 'end_turn',
      usage: { input_tokens: 100, output_tokens: 50 },
    }),
  },
}));

Anthropic.default = Anthropic;
module.exports = Anthropic;
module.exports.default = Anthropic;
