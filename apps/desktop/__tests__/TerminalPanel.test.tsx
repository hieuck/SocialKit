/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TerminalPanel from '../src/renderer/TerminalPanel'

declare global {
  interface Window { socialkit: { run: jest.Mock } }
}

beforeEach(() => {
  ;(window as any).socialkit = { run: jest.fn().mockResolvedValue('mock output') }
})

describe('TerminalPanel', () => {
  it('renders command input', () => {
    render(<TerminalPanel />)
    expect(screen.getByPlaceholderText(/socialkit/)).toBeInTheDocument()
  })

  it('shows command in history after submit', async () => {
    render(<TerminalPanel />)
    const input = screen.getByPlaceholderText(/socialkit/)
    fireEvent.change(input, { target: { value: 'whoami' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    await waitFor(() => expect(screen.getByText('> whoami')).toBeInTheDocument())
  })

  it('calls socialkit.run with parsed args', () => {
    render(<TerminalPanel />)
    const input = screen.getByPlaceholderText(/socialkit/)
    fireEvent.change(input, { target: { value: 'post --page me --message hello' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect((window as any).socialkit.run).toHaveBeenCalledWith(['post', '--page', 'me', '--message', 'hello'])
  })
})
