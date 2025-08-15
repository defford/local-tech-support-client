import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

describe('Alert', () => {
  it('renders children and has role alert', () => {
    render(
      <Alert>
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>Something happened</AlertDescription>
      </Alert>
    )

    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(screen.getByText('Heads up')).toBeInTheDocument()
    expect(screen.getByText('Something happened')).toBeInTheDocument()
  })
})


