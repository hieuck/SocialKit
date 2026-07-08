declare global {
  interface Window {
    socialkit: {
      run: jest.Mock
      getPlatforms: jest.Mock
      login: jest.Mock
      getLoginUrl: jest.Mock
    }
  }
}

export {}
