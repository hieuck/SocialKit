import React from 'react'

interface ButtonProps {
  variant?: 'primary' | 'secondary'
  disabled?: boolean
  onClick?: () => void
  children: React.ReactNode
}

export function Button(props: ButtonProps): React.ReactElement {
  const bg = props.variant === 'primary' ? '#0066cc' : '#eee'
  const color = props.variant === 'primary' ? '#fff' : '#333'
  return React.createElement('button', {
    style: { padding: '8px 16px', background: bg, color, border: 'none', borderRadius: 4, cursor: 'pointer' },
    disabled: props.disabled,
    onClick: props.onClick,
  }, props.children)
}

interface CardProps {
  title: string
  children: React.ReactNode
}

export function Card(props: CardProps): React.ReactElement {
  return React.createElement('div', { style: { border: '1px solid #ddd', borderRadius: 6, padding: 16, marginBottom: 12 } },
    React.createElement('h3', { style: { margin: '0 0 8px' } }, props.title),
    props.children,
  )
}

interface TextInputProps {
  label: string
  value: string
  onChange: (value: string) => void
}

export function TextInput(props: TextInputProps): React.ReactElement {
  return React.createElement('label', { style: { display: 'block', marginBottom: 8 } },
    props.label,
    React.createElement('br'),
    React.createElement('input', {
      value: props.value,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => props.onChange(e.target.value),
      style: { width: '100%', padding: '4px 8px', marginTop: 4 },
    }),
  )
}
