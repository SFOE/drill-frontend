import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '@/App.vue'

describe('App', () => {
  it('renders a router-view outlet', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          'router-view': { template: '<div class="rv-stub" />' },
        },
      },
    })
    expect(wrapper.find('.rv-stub').exists()).toBe(true)
  })
})
