/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import App from '../src/renderer/App'

declare global {
  interface Window { socialkit: { run: jest.Mock; getPlatforms: jest.Mock; login: jest.Mock } }
}

beforeEach(() => {
  ;(window as any).socialkit = {
    run: jest.fn().mockResolvedValue('mock result'),
    getPlatforms: jest.fn().mockResolvedValue(['facebook', 'instagram', 'zalo']),
    login: jest.fn().mockResolvedValue('Logged in successfully.'),
  }
})

describe('App', () => {
  it('renders sidebar with SocialKit logo', () => {
    render(<App />)
    expect(screen.getByText('SocialKit')).toBeInTheDocument()
  })

  it('shows login view by default', () => {
    render(<App />)
    expect(screen.getByText(/Select a platform/)).toBeInTheDocument()
  })

  it('switches to post view on sidebar click', () => {
    render(<App />)
    fireEvent.click(screen.getByText('Post'))
    expect(screen.getByText(/Publish a new post/)).toBeInTheDocument()
  })

  it('switches to schedule view on sidebar click', () => {
    render(<App />)
    fireEvent.click(screen.getByText('Schedule'))
    expect(screen.getByText(/Schedule a post/)).toBeInTheDocument()
  })
})
