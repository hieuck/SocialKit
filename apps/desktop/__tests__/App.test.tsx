/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import App from '../src/renderer/App'

declare global {
  interface Window { socialkit: { run: jest.Mock; getPlatforms: jest.Mock; login: jest.Mock; getLoginUrl: jest.Mock } }
}

beforeEach(() => {
  ;(window as any).socialkit = {
    run: jest.fn().mockResolvedValue('mock'),
    getPlatforms: jest.fn().mockResolvedValue(['facebook']),
    login: jest.fn().mockResolvedValue('ok'),
    getLoginUrl: jest.fn().mockResolvedValue('https://fb.com/login'),
  }
})

describe('App', () => {
  it('renders login view by default', () => {
    render(<App />)
    expect(screen.getByText(/Select a platform/)).toBeInTheDocument()
  })

  it('switches tabs via sidebar', () => {
    render(<App />)
    fireEvent.click(screen.getByTitle('Post'))
    expect(screen.getByText(/Publish a new post/)).toBeInTheDocument()
  })

  it('toggles terminal panel', () => {
    render(<App />)
    fireEvent.click(screen.getByTitle('Terminal'))
    expect(screen.getByPlaceholderText(/socialkit/)).toBeInTheDocument()
  })
})
