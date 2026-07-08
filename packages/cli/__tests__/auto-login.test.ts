describe('autoLoginFacebook', () => {
  it('module exports autoLoginFacebook function', () => {
    const mod = require('../src/auto-login')
    expect(typeof mod.autoLoginFacebook).toBe('function')
  })

  it('is an async function', () => {
    const mod = require('../src/auto-login')
    expect(mod.autoLoginFacebook.constructor.name).toBe('AsyncFunction')
  })
})
