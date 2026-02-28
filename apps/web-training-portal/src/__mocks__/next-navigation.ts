// Minimal Next.js navigation mock for Jest
export const useRouter = () => ({ push: jest.fn(), replace: jest.fn() });
export const useSearchParams = () => ({ get: jest.fn().mockReturnValue(null) });
export const notFound = jest.fn();
