import { render, screen } from '@testing-library/react'
import { Button } from './button'

describe('Button Component', () => {
  it('renders correctly with default props', () => {
    render(<Button>Click me</Button>)

    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-primary')
  })

  it('renders with variant prop', () => {
    render(<Button variant="outline">Outline Button</Button>)

    const button = screen.getByRole('button', { name: /outline button/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('border')
    expect(button).toHaveClass('bg-background')
  })

  it('renders with size prop', () => {
    render(<Button size="lg">Large Button</Button>)

    const button = screen.getByRole('button', { name: /large button/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('h-10')
    expect(button).toHaveClass('px-6')
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>)

    const button = screen.getByRole('button', { name: /disabled button/i })
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:pointer-events-none')
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Clickable</Button>)

    const button = screen.getByRole('button', { name: /clickable/i })
    button.click()

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})