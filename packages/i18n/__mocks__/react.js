// Minimal React mock for testing i18n modules that import React
module.exports = {
  useState: jest.fn().mockImplementation((init) => [init, jest.fn()]),
  useEffect: jest.fn(),
  useRef: jest.fn().mockReturnValue({ current: null }),
  useCallback: jest.fn().mockImplementation((fn) => fn),
  useContext: jest.fn().mockReturnValue({ locale: 'en', switchLocale: jest.fn() }),
  createContext: jest.fn().mockReturnValue({ Provider: 'Provider', Consumer: 'Consumer' }),
  createElement: jest.fn().mockReturnValue(null),
};
