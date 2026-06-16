/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import App from '../src/renderer/App'

beforeAll(() => {
  ;(window as any).socialkit = {
    run: async () => 'mock result',
    getPlatforms: async () => ['facebook', 'instagram', 'zalo'],
  }
})

describe('App', () => {
  it('renders the app title', () => {
    render(<App />)
    expect(screen.getByText('SocialKit')).toBeInTheDocument()
  })

  it('shows Login tab by default', () => {
    render(<App />)
    expect(screen.getByText('login')).toBeInTheDocument()
  })

  it('shows Post tab', () => {
    render(<App />)
    expect(screen.getByText('post')).toBeInTheDocument()
  })

  it('shows Schedule tab', () => {
    render(<App />)
    expect(screen.getByText('schedule')).toBeInTheDocument()
  })

  it('displays login placeholder by default', () => {
    render(<App />)
    expect(screen.getByText('Login view — select a platform to begin')).toBeInTheDocument()
  })

  it('switches to post view on tab click', () => {
    render(<App />)
    fireEvent.click(screen.getByText('post'))
    expect(screen.getByText('Post view — publish to your page')).toBeInTheDocument()
  })
})
