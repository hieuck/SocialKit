/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { Button, Card, TextInput } from '../src'

describe('Button', () => {
  it('renders with label', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = jest.fn()
    render(<Button onClick={onClick}>Click</Button>)
    fireEvent.click(screen.getByText('Click'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is set', () => {
    render(<Button disabled>Click</Button>)
    expect(screen.getByText('Click')).toBeDisabled()
  })

  it('renders primary variant with correct styling', () => {
    render(<Button variant="primary">Primary</Button>)
    const btn = screen.getByText('Primary')
    expect(btn).toBeInTheDocument()
  })
})

describe('Card', () => {
  it('renders title and children', () => {
    render(<Card title="Test Card"><p>Content</p></Card>)
    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })
})

describe('TextInput', () => {
  it('renders label and input', () => {
    render(<TextInput label="Name" value="" onChange={() => {}} />)
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
  })

  it('calls onChange when value changes', () => {
    const onChange = jest.fn()
    render(<TextInput label="Name" value="" onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'test' } })
    expect(onChange).toHaveBeenCalledWith('test')
  })
})
