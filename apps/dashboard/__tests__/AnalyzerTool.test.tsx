/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import AnalyzerTool from '../src/AnalyzerTool'

describe('AnalyzerTool', () => {
  it('renders text input area', () => {
    render(<AnalyzerTool />)
    expect(screen.getByPlaceholderText(/Paste your post text/)).toBeInTheDocument()
  })

  it('shows word count stat for input text', () => {
    render(<AnalyzerTool />)
    const textarea = screen.getByPlaceholderText(/Paste your post text/)
    fireEvent.change(textarea, { target: { value: 'Hello world from SocialKit' } })
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('Words')).toBeInTheDocument()
  })

  it('shows hashtag count', () => {
    render(<AnalyzerTool />)
    const textarea = screen.getByPlaceholderText(/Paste your post text/)
    fireEvent.change(textarea, { target: { value: 'Hello #world from #SocialKit' } })
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Hashtags')).toBeInTheDocument()
  })

  it('shows content score', () => {
    render(<AnalyzerTool />)
    const textarea = screen.getByPlaceholderText(/Paste your post text/)
    fireEvent.change(textarea, { target: { value: 'Hello #world from #SocialKit with many words for scoring' } })
    expect(screen.getByText('Score')).toBeInTheDocument()
  })

  it('shows zero stats for empty input', () => {
    render(<AnalyzerTool />)
    const zeroes = screen.getAllByText('0')
    expect(zeroes.length).toBeGreaterThanOrEqual(5)
  })

  it('shows read time estimate for non-empty text', () => {
    render(<AnalyzerTool />)
    const textarea = screen.getByPlaceholderText(/Paste your post text/)
    fireEvent.change(textarea, { target: { value: 'A '.repeat(100) } })
    expect(screen.getByText(/Read time/)).toBeInTheDocument()
  })
})
