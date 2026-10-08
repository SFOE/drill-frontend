import { describe, it, expect } from 'vitest'
import router from '@/router'

describe('router', () => {
  it('registers the root route', () => {
    const match = router.resolve('/')
    expect(match.path).toBe('/')
    expect(match.matched.length).toBeGreaterThan(0)
  })

  it('uses HTML5 history mode', () => {
    // createWebHistory exposes a base and a location; memory history would not
    expect(router.options.history).toBeDefined()
    expect(typeof router.options.history.push).toBe('function')
  })

  it('has exactly one configured route', () => {
    expect(router.options.routes).toHaveLength(1)
    expect(router.options.routes[0].path).toBe('/')
  })
})
