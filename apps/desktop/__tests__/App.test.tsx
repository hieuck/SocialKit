/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import App from '../src/renderer/App'

describe('App', () => {
  it('renders browser URL input', () => {
    render(<App />)
    const input = screen.getByDisplayValue('https://facebook.com')
    expect(input).toBeInTheDocument()
  })

  it('shows Login tab by default', () => {
    render(<App />)
    const logins = screen.getAllByText('Login')
    expect(logins.length).toBeGreaterThanOrEqual(1)
  })

  it('switches to Post tab', () => {
    render(<App />)
    fireEvent.click(screen.getByText('Post'))
    expect(screen.getByText(/Post to Facebook/)).toBeInTheDocument()
  })

  it('shows navigation buttons', () => {
    render(<App />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(2)
  })
})
