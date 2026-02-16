// Minimal React mock for testing i18n modules that import React
module.exports = {
  useState: jest.fn().mockImplementation((init) => [init, jest.fn()]),
  useEffect: jest.fn(),
  useRef: jest.fn().mockReturnValue({ current: null }),
  createElement: jest.fn().mockReturnValue(null),
};
