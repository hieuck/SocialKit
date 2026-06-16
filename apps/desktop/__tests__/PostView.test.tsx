/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PostView from '../src/renderer/PostView'

declare global {
  interface Window { socialkit: { run: jest.Mock; getPlatforms: jest.Mock } }
}

beforeEach(() => {
  ;(window as any).socialkit = {
    run: jest.fn().mockResolvedValue('Posted: new_post_123'),
    getPlatforms: jest.fn().mockResolvedValue(['facebook']),
  }
})

describe('PostView', () => {
  it('renders input fields', () => {
    render(<PostView onResult={() => {}} />)
    expect(screen.getByLabelText(/Page ID/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Message/)).toBeInTheDocument()
    expect(screen.getByText('Publish')).toBeInTheDocument()
  })

  it('calls CLI post command on submit', async () => {
    render(<PostView onResult={() => {}} />)
    fireEvent.change(screen.getByLabelText(/Page ID/), { target: { value: 'page1' } })
    fireEvent.change(screen.getByLabelText(/Message/), { target: { value: 'Hello world' } })
    fireEvent.click(screen.getByText('Publish'))

    await waitFor(() => {
      expect((window as any).socialkit.run).toHaveBeenCalledWith(['post', '--page', 'page1', '--message', 'Hello world'])
    })
  })

  it('passes result to onResult', async () => {
    const onResult = jest.fn()
    render(<PostView onResult={onResult} />)
    fireEvent.change(screen.getByLabelText(/Page ID/), { target: { value: 'p1' } })
    fireEvent.change(screen.getByLabelText(/Message/), { target: { value: 'test' } })
    fireEvent.click(screen.getByText('Publish'))

    await waitFor(() => {
      expect(onResult).toHaveBeenCalledWith('Posted: new_post_123')
    })
  })
})
