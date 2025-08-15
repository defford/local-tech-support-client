import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('handles conditionals and falsy values', () => {
    const isActive = false
    expect(cn('base', isActive && 'active', undefined, null, '')).toBe('base')
  })

  it('deduplicates conflicting tailwind classes via tailwind-merge', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })
})


