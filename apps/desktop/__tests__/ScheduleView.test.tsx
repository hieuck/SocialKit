/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import ScheduleView from '../src/renderer/ScheduleView'

declare global {
  interface Window { socialkit: { run: jest.Mock; getPlatforms: jest.Mock } }
}

beforeEach(() => {
  ;(window as any).socialkit = {
    run: jest.fn().mockResolvedValue('Scheduled: task_1 on page1'),
    getPlatforms: jest.fn().mockResolvedValue(['facebook']),
  }
})

describe('ScheduleView', () => {
  it('renders schedule form', () => {
    render(<ScheduleView onResult={() => {}} />)
    expect(screen.getByLabelText(/Page ID/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Message/)).toBeInTheDocument()
    expect(screen.getByText('Schedule')).toBeInTheDocument()
  })

  it('shows optional time input', () => {
    render(<ScheduleView onResult={() => {}} />)
    expect(screen.getByLabelText(/Time/)).toBeInTheDocument()
  })
})
