/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import PostView from '../src/renderer/PostView'

describe('PostView', () => {
  it('renders form title and labels', () => {
    render(<PostView onResult={() => {}} />)
    expect(screen.getByText('Publish Post')).toBeInTheDocument()
    expect(screen.getByText('Page ID')).toBeInTheDocument()
    expect(screen.getByText('Message')).toBeInTheDocument()
    expect(screen.getByText('Publish')).toBeInTheDocument()
  })
})
