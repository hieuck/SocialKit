import { execSync } from 'child_process'
import { join } from 'path'
import { fileURLToPath } from 'url'

const cli = join(process.cwd(), '../../packages/cli/dist/cli-entry.js')

function run(cmd: string): string {
  const result = execSync(`node ${cli} --mock ${cmd}`, { encoding: 'utf-8', timeout: 5000 })
  return result.trim()
}

console.log('=== SocialKit Demo (--mock mode, no API needed) ===')
console.log()

console.log('▶  login facebook')
console.log(run('login facebook'))
console.log()

console.log('▶  login facebook --token demo')
console.log(run('login facebook --token demo'))
console.log()

console.log('▶  whoami')
console.log(run('whoami'))
console.log()

console.log('▶  post --page me --message "Hello from SocialKit!"')
console.log(run('post --page me --message "Hello from SocialKit!"'))
console.log()

console.log('▶  post --page me --message "Second post" --link https://example.com')
console.log(run('post --page me --message "Second post" --link https://example.com'))
console.log()

console.log('▶  configure')
console.log(run('configure'))
console.log()

console.log('▶  schedule --page me --message "Future post" --at "2099-01-01"')
const sched = run('schedule --page me --message "Future post" --at "2099-01-01"')
console.log(sched.split('\n')[0])
console.log()

console.log('=== Demo complete. 0 API calls made. ===')
