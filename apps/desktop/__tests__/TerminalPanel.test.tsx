/**
 * @jest-environment jsdom
 */
/// <reference path="../src/types/window-mock.d.ts" />
import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TerminalPanel from '../src/renderer/TerminalPanel'

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
    const input = screen.getByPlaceholderText(/socialkit/) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'whoami' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    await waitFor(() => {
      expect(screen.getByText('> whoami')).toBeInTheDocument()
      expect(input.value).toBe('')
    })
  })

  it('calls socialkit.run with parsed args', async () => {
    render(<TerminalPanel />)
    const input = screen.getByPlaceholderText(/socialkit/) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'post --page me --message hello' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    await waitFor(() => expect(input.value).toBe(''))
    expect((window as any).socialkit.run).toHaveBeenCalledWith(['post', '--page', 'me', '--message', 'hello'])
  })
})
