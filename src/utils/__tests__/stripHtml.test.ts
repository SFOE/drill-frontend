import { describe, it, expect } from 'vitest'
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
})
