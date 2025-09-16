import { cn } from './utils'

describe('Utils', () => {
  describe('cn function', () => {
    it('merges class names correctly', () => {
      const result = cn('text-black', 'bg-white')
      expect(result).toBe('text-black bg-white')
    })

    it('handles conditional classes', () => {
      const result = cn('text-black', false && 'bg-white', 'p-4')
      expect(result).toBe('text-black p-4')
    })

    it('handles undefined and null', () => {
      const result = cn('text-black', undefined, null, 'p-4')
      expect(result).toBe('text-black p-4')
    })

    it('handles empty strings', () => {
      const result = cn('text-black', '', 'p-4')
      expect(result).toBe('text-black p-4')
    })

    it('resolves conflicts with tailwind-merge', () => {
      const result = cn('text-black text-white')
      expect(result).toBe('text-white')
    })
  })
})