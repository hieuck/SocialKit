import { Session } from '../src/session'
import { existsSync, unlinkSync, mkdtempSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

describe('Session', () => {
  let tmpDir: string
  let sessionPath: string

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'socialkit-test-'))
    sessionPath = join(tmpDir, 'session.json')
  })

  afterEach(() => {
    if (existsSync(sessionPath)) unlinkSync(sessionPath)
  })

  it('returns empty array when no sessions exist', () => {
    const session = new Session(sessionPath)
    expect(session.list()).toEqual([])
  })

  it('saves and retrieves a token', () => {
    const session = new Session(sessionPath)
    session.save('facebook', 'tok_123')
    expect(session.get('facebook')).toBe('tok_123')
  })

  it('lists configured platforms', () => {
    const session = new Session(sessionPath)
    session.save('facebook', 'tok_1')
    session.save('instagram', 'tok_2')
    expect(session.list()).toEqual(['facebook', 'instagram'])
  })

  it('overwrites existing token for same platform', () => {
    const session = new Session(sessionPath)
    session.save('facebook', 'old_tok')
    session.save('facebook', 'new_tok')
    expect(session.get('facebook')).toBe('new_tok')
  })

  it('persists data to disk', () => {
    const s1 = new Session(sessionPath)
    s1.save('facebook', 'tok_disk')
    s1.save('instagram', 'tok_insta')

    const s2 = new Session(sessionPath)
    expect(s2.get('facebook')).toBe('tok_disk')
    expect(s2.get('instagram')).toBe('tok_insta')
    expect(s2.list()).toEqual(['facebook', 'instagram'])
  })

  it('returns undefined for unknown platform', () => {
    const session = new Session(sessionPath)
    expect(session.get('zalo')).toBeUndefined()
  })
})
