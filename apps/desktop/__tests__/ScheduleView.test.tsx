/**
 * @jest-environment jsdom
 */
/// <reference path="../types/window-mock.d.ts" />
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import ScheduleView from '../src/renderer/ScheduleView'

beforeEach(() => {
  ;(window as any).socialkit = {
    run: jest.fn().mockResolvedValue('Scheduled: task_1'),
    getPlatforms: jest.fn().mockResolvedValue(['facebook']),
    login: jest.fn(),
  }
})

describe('ScheduleView', () => {
  it('renders schedule form', () => {
    render(<ScheduleView onResult={() => {}} />)
    expect(screen.getByText('Schedule Post')).toBeInTheDocument()
    expect(screen.getByText('Page ID')).toBeInTheDocument()
    expect(screen.getByText('Message')).toBeInTheDocument()
    expect(screen.getByText('Schedule')).toBeInTheDocument()
  })

  it('shows optional time input', () => {
    render(<ScheduleView onResult={() => {}} />)
    expect(screen.getByText('Schedule Time')).toBeInTheDocument()
  })
})
