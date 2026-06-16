import { getSessionPath } from '../src/cli-entry'
import { existsSync, mkdtempSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

describe('cli-entry', () => {
  describe('getSessionPath', () => {
    it('returns custom path when provided', () => {
      const path = getSessionPath('/custom/path/session.json')
      expect(path).toBe('/custom/path/session.json')
    })

    it('returns default path in home directory', () => {
      const result = getSessionPath()
      expect(result).toContain('.socialkit')
      expect(result).toContain('session.json')
    })
  })
})
