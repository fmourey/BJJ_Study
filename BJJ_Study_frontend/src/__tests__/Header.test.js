import { mount } from '@vue/test-utils'
import Header from '../components/Header.vue'

describe('Header.vue', () => {
  it('should render the header', () => {
    const wrapper = mount(Header)
    expect(wrapper.find('.header').exists()).toBe(true)
  })

  it('should display home text', () => {
    const wrapper = mount(Header)
    expect(wrapper.text()).toContain('Accueil')
  })

  it('should display login button', () => {
    const wrapper = mount(Header)
    const loginBtn = wrapper.find('.login')
    expect(loginBtn.exists()).toBe(true)
    expect(loginBtn.text()).toBe('Connexion')
  })

  it('should have correct button styles', () => {
    const wrapper = mount(Header)
    const loginBtn = wrapper.find('.login')
    
    expect(loginBtn.element.tagName).toBe('BUTTON')
    expect(loginBtn.classes()).toContain('login')
  })

  it('should display home and login in correct layout', () => {
    const wrapper = mount(Header)
    const header = wrapper.find('.header')
    
    // Check structure
    const children = header.findAll('div, button')
    expect(children.length).toBeGreaterThan(0)
    expect(wrapper.find('.home').exists()).toBe(true)
    expect(wrapper.find('.login').exists()).toBe(true)
  })
})
