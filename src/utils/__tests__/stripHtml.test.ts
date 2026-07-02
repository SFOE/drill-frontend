import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { stripHtml } from '@/utils/stripHtml'

describe('stripHtml', () => {
  it('removes HTML tags and returns plain text', () => {
    expect(stripHtml('<b>Hello</b> World')).toBe('Hello World')
  })

  it('handles nested tags', () => {
    expect(stripHtml('<div><span>Nested</span> <em>content</em></div>')).toBe('Nested content')
  })

  it('returns empty string for empty input', () => {
    expect(stripHtml('')).toBe('')
  })

  it('returns plain text unchanged', () => {
    expect(stripHtml('no tags here')).toBe('no tags here')
  })

  it('replaces # surrounded by optional spaces with a single space', () => {
    expect(stripHtml('Ittigenstrasse 13 <b>3063 #Ittigen</b>')).toBe(
      'Ittigenstrasse 13 3063 Ittigen',
    )
  })

  it('trims leading and trailing whitespace', () => {
    expect(stripHtml('  <p> spaced </p>  ')).toBe('spaced')
  })

  it('handles multiple # separators', () => {
    expect(stripHtml('a # b # c')).toBe('a b c')
  })

  it('does not execute script tags (XSS safety)', () => {
    const malicious = '<script>alert("xss")</script>Safe text'
    const result = stripHtml(malicious)
    expect(result).not.toContain('<script>')
    expect(result).toContain('Safe text')
  })

  // Property-based tests
  describe('property-based hardening', () => {
    it('never returns recognized HTML tags in output', () => {
      fc.assert(
        fc.property(fc.string(), (input) => {
          const result = stripHtml(input)
          // Valid HTML tags have at least one letter after <
          expect(result).not.toMatch(/<\/?[a-zA-Z][^>]*>/)
        }),
        { numRuns: 200 },
      )
    })

    it('output length never exceeds input length', () => {
      fc.assert(
        fc.property(fc.string(), (input) => {
          expect(stripHtml(input).length).toBeLessThanOrEqual(input.length)
        }),
        { numRuns: 200 },
      )
    })

    it('is idempotent — applying stripHtml twice gives the same result', () => {
      fc.assert(
        fc.property(fc.string(), (input) => {
          const once = stripHtml(input)
          const twice = stripHtml(once)
          expect(twice).toBe(once)
        }),
        { numRuns: 200 },
      )
    })

    it('always returns a string (never throws)', () => {
      fc.assert(
        fc.property(fc.string(), (input) => {
          const result = stripHtml(input)
          expect(typeof result).toBe('string')
        }),
        { numRuns: 200 },
      )
    })
  })
})
