// Minimal jsx-runtime mock for testing i18n modules
module.exports = {
  jsx: jest.fn().mockReturnValue(null),
  jsxs: jest.fn().mockReturnValue(null),
  Fragment: 'Fragment',
};
