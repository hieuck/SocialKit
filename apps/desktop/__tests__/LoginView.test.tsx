/**
 * @jest-environment jsdom
 */
/// <reference path="../src/types/window-mock.d.ts" />
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import LoginView from '../src/renderer/LoginView'

beforeEach(() => {
  ;(window as any).socialkit = {
    run: jest.fn().mockResolvedValue('mock result'),
    getPlatforms: jest.fn().mockResolvedValue(['facebook', 'instagram', 'zalo']),
    login: jest.fn().mockResolvedValue('Logged in successfully.'),
    getLoginUrl: jest.fn().mockResolvedValue('https://facebook.mock/login'),
  }
})

describe('LoginView', () => {
  it('renders platform selector', () => {
    render(<LoginView onResult={() => {}} />)
    expect(screen.getByLabelText('Platform')).toBeInTheDocument()
    expect(screen.getByText('Facebook')).toBeInTheDocument()
    expect(screen.getByText('Instagram')).toBeInTheDocument()
    expect(screen.getByText('Zalo')).toBeInTheDocument()
  })

  it('calls onOpenBrowser when getLoginUrl succeeds', async () => {
    const onOpenBrowser = jest.fn()
    render(<LoginView onResult={() => {}} onOpenBrowser={onOpenBrowser} />)
    fireEvent.click(screen.getByText(/Login with/))
    await new Promise(r => setTimeout(r, 50))
    expect(onOpenBrowser).toHaveBeenCalledWith('https://facebook.mock/login')
  })
})
