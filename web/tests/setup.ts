import '@testing-library/jest-dom/vitest'

// jsdom 沒有實作 matchMedia,加 polyfill 否則 theme.ts 會 crash
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}
