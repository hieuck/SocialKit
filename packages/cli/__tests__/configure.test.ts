import { configureCommand } from '../src/configure'
import { Config } from '../src/config'
import { mkdtempSync, existsSync, unlinkSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

describe('configureCommand', () => {
  let tmpFile: string
  let config: Config

  beforeEach(() => {
    tmpFile = join(mkdtempSync(join(tmpdir(), 'cfg-cmd-')), 'config.json')
    config = new Config(tmpFile)
  })

  afterEach(() => {
    if (existsSync(tmpFile)) unlinkSync(tmpFile)
  })

  it('shows current config for a platform', () => {
    config.set('facebook', 'appId', 'fb_id')
    const result = configureCommand(config, { platform: 'facebook' })
    expect(result).toContain('facebook')
    expect(result).toContain('appId')
  })

  it('sets a config value', () => {
    const result = configureCommand(config, { platform: 'facebook', key: 'appId', value: 'new_id' })
    expect(result).toContain('facebook')
    expect(result).toContain('appId')
    expect(config.get('facebook', 'appId')).toBe('new_id')
  })

  it('lists configured platforms', () => {
    config.set('facebook', 'appId', 'x')
    config.set('zalo', 'appId', 'y')
    const result = configureCommand(config, {})
    expect(result).toContain('facebook')
    expect(result).toContain('zalo')
  })

  it('shows instructions when no platform configured', () => {
    const result = configureCommand(config, {})
    expect(result).toContain('No platforms configured')
  })
})
