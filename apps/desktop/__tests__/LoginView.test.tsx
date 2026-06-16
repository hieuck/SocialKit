/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginView from '../src/renderer/LoginView'

declare global {
  interface Window {
    socialkit: {
      run: jest.Mock
      getPlatforms: jest.Mock
    }
  }
}

beforeEach(() => {
  ;(window as any).socialkit = {
    run: jest.fn().mockResolvedValue('mock result'),
    getPlatforms: jest.fn().mockResolvedValue(['facebook', 'instagram', 'zalo']),
  }
})

describe('LoginView', () => {
  it('renders platform selector', () => {
    render(<LoginView onResult={() => {}} />)
    expect(screen.getByLabelText(/Platform/)).toBeInTheDocument()
    expect(screen.getByText('facebook')).toBeInTheDocument()
    expect(screen.getByText('instagram')).toBeInTheDocument()
    expect(screen.getByText('zalo')).toBeInTheDocument()
  })

  it('shows login URL on button click', async () => {
    ;(window as any).socialkit.run = jest.fn().mockResolvedValue('https://mock/login?client_id=123')

    render(<LoginView onResult={() => {}} />)
    fireEvent.click(screen.getByText('Get Login URL'))

    await waitFor(() => {
      expect(screen.getByText(/mock\/login/)).toBeInTheDocument()
    })
    expect((window as any).socialkit.run).toHaveBeenCalledWith(['login', 'facebook'])
  })

  it('calls onResult with command output', async () => {
    const onResult = jest.fn()
    ;(window as any).socialkit.run = jest.fn().mockResolvedValue('https://mock/login')

    render(<LoginView onResult={onResult} />)
    fireEvent.click(screen.getByText('Get Login URL'))

    await waitFor(() => {
      expect(onResult).toHaveBeenCalledWith('https://mock/login')
    })
  })
})
