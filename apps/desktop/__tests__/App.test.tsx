/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import App from '../src/renderer/App'

describe('App', () => {
  it('renders browser URL input with Facebook default', () => {
    render(<App />)
    const input = screen.getByDisplayValue('https://facebook.com')
    expect(input).toBeInTheDocument()
  })

  it('shows Profile tab with login instructions', () => {
    render(<App />)
    expect(screen.getByText(/Login to Facebook/)).toBeInTheDocument()
  })

  it('switches to Posts tab', () => {
    render(<App />)
    fireEvent.click(screen.getByText('Posts'))
    const btns = screen.getAllByText(/Refresh/)
    expect(btns.length).toBeGreaterThanOrEqual(1)
  })

  it('switches to Pages tab', () => {
    render(<App />)
    fireEvent.click(screen.getByText('Pages'))
    const btns = screen.getAllByText(/Refresh/)
    expect(btns.length).toBeGreaterThanOrEqual(1)
  })

  it('switches to Publish tab', () => {
    render(<App />)
    fireEvent.click(screen.getByText('Publish'))
    expect(screen.getByText(/Publish Post/)).toBeInTheDocument()
  })
})
