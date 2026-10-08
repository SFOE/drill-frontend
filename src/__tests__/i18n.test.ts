import { describe, it, expect, beforeEach } from 'vitest'
import i18n, { setLocale } from '@/i18n'

describe('i18n', () => {
  beforeEach(() => {
    // Reset to default locale between tests
    i18n.global.locale.value = 'de'
    document.documentElement.lang = ''
    document.title = ''
  })

  it('initializes with German as the default locale', () => {
    expect(i18n.global.locale.value).toBe('de')
    expect(i18n.global.availableLocales).toContain('de')
  })

  it('translates a known key', () => {
    expect(i18n.global.t('header_title')).toBe('Bundesamt für Energie BFE')
  })

  it('setLocale lazily loads and activates a new locale', async () => {
    expect(i18n.global.availableLocales).not.toContain('fr')

    await setLocale('fr')

    expect(i18n.global.availableLocales).toContain('fr')
    expect(i18n.global.locale.value).toBe('fr')
    expect(document.documentElement.lang).toBe('fr')
  })

  it('setLocale updates document.title from the page_title translation', async () => {
    await setLocale('de')
    expect(document.title).toBe(i18n.global.t('page_title'))
    expect(document.title.length).toBeGreaterThan(0)
  })

  it('setLocale updates the meta description when the tag is present', async () => {
    const meta = document.createElement('meta')
    meta.setAttribute('name', 'description')
    document.head.appendChild(meta)

    await setLocale('de')

    expect(meta.getAttribute('content')).toBe(i18n.global.t('meta_description'))
    document.head.removeChild(meta)
  })

  it('setLocale does not reload an already-available locale', async () => {
    // de is loaded at init; calling again should still work and set the locale
    await setLocale('de')
    expect(i18n.global.locale.value).toBe('de')
    expect(document.documentElement.lang).toBe('de')
  })
})
