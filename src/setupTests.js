import "@testing-library/jest-dom";

const store = {};
const localStorageMock = {
  getItem: vi.fn((key) => store[key] ?? null),
  setItem: vi.fn((key, value) => { store[key] = String(value); }),
  removeItem: vi.fn((key) => { delete store[key]; }),
  clear: vi.fn(() => { Object.keys(store).forEach((k) => delete store[k]); }),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

beforeEach(() => {
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  Object.keys(store).forEach((k) => delete store[k]);
});
