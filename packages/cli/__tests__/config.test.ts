import { Config } from '../src/config'
import { mkdtempSync, existsSync, unlinkSync, readFileSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

describe('Config', () => {
  let tmpFile: string

  beforeEach(() => {
    tmpFile = join(mkdtempSync(join(tmpdir(), 'config-test-')), 'config.json')
  })

  afterEach(() => {
    if (existsSync(tmpFile)) unlinkSync(tmpFile)
  })

  it('returns defaults when no file exists', () => {
    const config = new Config(tmpFile)
    expect(config.get('facebook', 'appId')).toBe('')
    expect(config.get('facebook', 'appSecret')).toBe('')
  })

  it('saves and retrieves a value', () => {
    const config = new Config(tmpFile)
    config.set('facebook', 'appId', 'my_app_123')
    expect(config.get('facebook', 'appId')).toBe('my_app_123')
  })

  it('saves and retrieves nested values per platform', () => {
    const config = new Config(tmpFile)
    config.set('facebook', 'appId', 'fb_id')
    config.set('instagram', 'appId', 'ig_id')
    expect(config.get('facebook', 'appId')).toBe('fb_id')
    expect(config.get('instagram', 'appId')).toBe('ig_id')
    expect(config.get('facebook', 'appSecret')).toBe('')
  })

  it('persists to disk', () => {
    const c1 = new Config(tmpFile)
    c1.set('facebook', 'appId', 'persisted_id')
    c1.set('facebook', 'appSecret', 'persisted_secret')

    const c2 = new Config(tmpFile)
    expect(c2.get('facebook', 'appId')).toBe('persisted_id')
    expect(c2.get('facebook', 'appSecret')).toBe('persisted_secret')
  })

  it('returns provider config as object', () => {
    const config = new Config(tmpFile)
    config.set('facebook', 'appId', 'id1')
    config.set('facebook', 'appSecret', 'secret1')
    const fb = config.getProvider('facebook')
    expect(fb).toEqual({ appId: 'id1', appSecret: 'secret1' })
  })

  it('lists configured platforms', () => {
    const config = new Config(tmpFile)
    config.set('facebook', 'appId', 'x')
    config.set('zalo', 'appId', 'y')
    expect(config.listConfigured()).toEqual(['facebook', 'zalo'])
  })
})
