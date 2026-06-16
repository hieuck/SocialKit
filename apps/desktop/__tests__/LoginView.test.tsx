/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import LoginView from '../src/renderer/LoginView'

declare global {
  interface Window {
    socialkit: {
      run: jest.Mock
      getPlatforms: jest.Mock
      login: jest.Mock
    }
  }
}

beforeEach(() => {
  ;(window as any).socialkit = {
    run: jest.fn().mockResolvedValue('mock result'),
    getPlatforms: jest.fn().mockResolvedValue(['facebook', 'instagram', 'zalo']),
    login: jest.fn().mockResolvedValue('Logged in successfully.'),
  }
})

describe('LoginView', () => {
  it('renders platform selector', () => {
    render(<LoginView onResult={() => {}} />)
    expect(screen.getByLabelText(/Platform/)).toBeInTheDocument()
    expect(screen.getByText('Facebook')).toBeInTheDocument()
    expect(screen.getByText('Instagram')).toBeInTheDocument()
    expect(screen.getByText('Zalo')).toBeInTheDocument()
  })

  it('calls socialkit.login on button click', () => {
    render(<LoginView onResult={() => {}} />)
    fireEvent.click(screen.getByText(/Login with/))
    expect((window as any).socialkit.login).toHaveBeenCalledWith('facebook')
  })

  it('calls onResult with success message', async () => {
    const onResult = jest.fn()
    ;(window as any).socialkit.login = jest.fn().mockResolvedValue('Logged in successfully.')
    render(<LoginView onResult={onResult} />)
    fireEvent.click(screen.getByText(/Login with/))
    await new Promise(r => setTimeout(r, 50))
    expect(onResult).toHaveBeenCalledWith('Logged in successfully.')
  })
})
