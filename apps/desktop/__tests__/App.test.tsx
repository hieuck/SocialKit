/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import App from '../src/renderer/App'

declare global {
  interface Window { socialkit: { run: jest.Mock; getPlatforms: jest.Mock } }
}

beforeEach(() => {
  ;(window as any).socialkit = {
    run: jest.fn().mockResolvedValue('mock result'),
    getPlatforms: jest.fn().mockResolvedValue(['facebook', 'instagram', 'zalo']),
  }
})

describe('App', () => {
  it('renders the app title', () => {
    render(<App />)
    expect(screen.getByText('SocialKit')).toBeInTheDocument()
  })

  it('shows login platform selector by default', () => {
    render(<App />)
    expect(screen.getByLabelText(/Platform/)).toBeInTheDocument()
  })

  it('switches to post view on tab click', () => {
    render(<App />)
    fireEvent.click(screen.getByText('post'))
    expect(screen.getByLabelText(/Message/)).toBeInTheDocument()
  })

  it('switches to schedule view on tab click', () => {
    render(<App />)
    fireEvent.click(screen.getByText('schedule'))
    expect(screen.getByLabelText(/Time/)).toBeInTheDocument()
  })
})
