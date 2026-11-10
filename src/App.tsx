import { useEffect, useRef, useState } from 'react'
import PageSections from './PageSections'
import HeroHeading from './HeroHeading'
import { useHeroScroll } from './useHeroScroll'
import { useMenuMotion } from './useMenuMotion'
import { imageProps, serviceImageSizes } from './images'

const asset = (name: string) => `/assets/${name}`

const services = [
  { title: 'Logo design', image: 'card1.png', icon: 'pen.svg' },
  { title: 'Development', image: 'card2.png', icon: 'scroll.svg' },
  { title: 'Ui/Ux Design', image: 'card3.png', icon: 'ruler.svg' },
  { title: 'Digital Marketing', image: 'card4.png', icon: 'monitor.svg' },
  { title: 'Content Writing', image: 'card5.png', icon: 'document.svg' },
  { title: 'Email Marketing', image: 'card6.png', icon: 'mail.svg' },
  { title: 'Motion Design', image: 'card7.png', icon: 'motion.svg' },
  { title: 'Print Design', image: 'card8.png', icon: 'print.svg' },
] as const

function Arrow() { return <span aria-hidden="true" className="arrow">→</span> }

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const menuPanel = useRef<HTMLElement>(null)
  const heroPanel = useRef<HTMLElement>(null)
  const aboutPanel = useRef<HTMLElement>(null)

  useHeroScroll(heroPanel, aboutPanel)
  useMenuMotion(menuPanel, menuOpen)

  useEffect(() => {
    if (!menuOpen) return
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setMenuOpen(false)
        menuButton.current?.focus()
      }
    }
    const dismissOutside = (event: Event) => {
      const target = event.target
      if (target instanceof Node && !menuPanel.current?.contains(target) && !menuButton.current?.contains(target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('keydown', onEscape)
    document.addEventListener('pointerdown', dismissOutside, true)
    document.addEventListener('focusin', dismissOutside)
    return () => {
      document.removeEventListener('keydown', onEscape)
      document.removeEventListener('pointerdown', dismissOutside, true)
      document.removeEventListener('focusin', dismissOutside)
    }
  }, [menuOpen])

  return <>
    <header className="site-header">
      <div className="container header-inner">
        <a className="brand" href="#top" aria-label="Creative Design Agency, back to top"><img {...imageProps('logo.png', '70px')} decoding="async" alt="Creative Design Agency" /></a>
        <button ref={menuButton} className="menu-toggle" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="site-menu" onClick={() => setMenuOpen(value => !value)}><img src={asset('hamburger.svg')} alt="" /></button>
        <nav ref={menuPanel} id="site-menu" className="site-menu" data-state={menuOpen ? 'open' : 'closed'} aria-label="Main navigation" aria-hidden={!menuOpen} inert={!menuOpen}><a href="#top" onClick={() => setMenuOpen(false)}>Home</a><a href="#about" onClick={() => setMenuOpen(false)}>About</a><a href="#services" onClick={() => setMenuOpen(false)}>Services</a><a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a><a href="#blogs" onClick={() => setMenuOpen(false)}>Blog</a></nav>
      </div>
    </header>
    <PageSections>
      <section ref={heroPanel} className="hero" aria-labelledby="hero-heading">
        <div className="container hero-inner">
          <div className="hero-copy">
            <HeroHeading />
            <a className="primary-button" href="#contact">Let’s talk <Arrow /></a>
          </div>
          <div className="hero-art"><div className="dot-pattern" aria-hidden="true" /><img className="hero-photo" {...imageProps('hero.png', '(max-width: 600px) 291px, (max-width: 1199px) 330px, 576px')} fetchPriority="high" decoding="async" alt="Woman reviewing color palettes at her desk" /></div>
        </div>
      </section>
      <section ref={aboutPanel} id="about" className="about" aria-labelledby="about-heading">
        <div className="container">
          <div className="section-intro"><h2 id="about-heading">Elevate Your Brand Identity</h2><p>Unlock the true potential of your brand. Our passionate team of creative experts is committed to delivering innovative and tailor-made solutions that elevate your brand to new heights.</p></div>
          <div className="about-content">
            <div className="about-photo-wrap"><img className="about-photo" {...imageProps('about.png', '(max-width: 600px) calc(140vw - 77px), (max-width: 1199px) 455px, 551px')} loading="lazy" decoding="async" alt="Creative team collaborating around a computer" /></div>
            <div className="about-text"><p>We believe that a strong brand is the cornerstone of every successful business. We are a passionate team of branding experts dedicated to helping businesses like yours create a unique and compelling brand identity.</p><p>With our extensive experience and deep understanding of brand strategy, design, and storytelling, we collaborate closely with our clients to craft brand experiences that resonate with their target audience. Our goal is to create brands that not only capture attention but also foster trust, loyalty, and recognition.</p></div>
          </div>
        </div>
      </section>
      <section id="services" className="services" aria-labelledby="services-heading"><div className="container"><h2 id="services-heading">Our Services</h2><div className={`services-grid ${showAll ? 'show-all' : ''}`}>{services.map((service, index) => <article className={`service-card ${index > 3 ? 'extra-card' : ''}`} key={service.title}><img {...imageProps(service.image, serviceImageSizes(service.image))} loading="lazy" decoding="async" alt="" /><div className="service-shade"/><div className="service-details"><h3><span className="service-icon" aria-hidden="true"><img src={asset(service.icon)} loading="lazy" alt="" /></span>{service.title}</h3><a className="text-button" href="#contact">Request a quote <Arrow /></a></div></article>)}</div><button className="primary-button view-more" type="button" aria-expanded={showAll} onClick={() => setShowAll(value => !value)}>{showAll ? 'View less' : 'View more'} <Arrow /></button><a className="primary-button quote-button" href="#contact">Request a Quote <Arrow /></a></div></section>
    </PageSections>
  </>
}

export default App
