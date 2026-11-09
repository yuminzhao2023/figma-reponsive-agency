import { useEffect, useRef, useState } from 'react'

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
]

function Arrow() { return <span aria-hidden="true" className="arrow">→</span> }

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [notice, setNotice] = useState('')
  const menuButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus() }
    }
    window.addEventListener('keydown', onEscape)
    return () => window.removeEventListener('keydown', onEscape)
  }, [menuOpen])

  const demoAction = () => {
    setNotice('Demo only — contact and quote requests are not connected yet.')
    window.setTimeout(() => setNotice(''), 5000)
  }

  return <>
    <header className="site-header">
      <div className="container header-inner">
        <a className="brand" href="#top" aria-label="Creative Design Agency, back to top"><img src={asset('logo.png')} alt="Creative Design Agency" /></a>
        <button ref={menuButton} className="menu-toggle" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="site-menu" onClick={() => setMenuOpen(value => !value)}><img src={asset('hamburger.svg')} alt="" /></button>
        {menuOpen && <nav id="site-menu" className="site-menu" aria-label="Main navigation"><a href="#top" onClick={() => setMenuOpen(false)}>Home</a><a href="#about" onClick={() => setMenuOpen(false)}>About</a><a href="#services" onClick={() => setMenuOpen(false)}>Services</a><button type="button" onClick={() => { setMenuOpen(false); demoAction() }}>Contact (demo)</button></nav>}
      </div>
    </header>
    <main id="top">
      <section className="hero" aria-labelledby="hero-heading">
        <div className="container hero-inner">
          <div className="hero-copy">
            <h1 id="hero-heading">Crafting <span className="underlined">Visual</span> Stories: Unleashing Creative Essence</h1>
            <button className="primary-button" type="button" onClick={demoAction}>Let’s talk <Arrow /></button>
          </div>
          <div className="hero-art"><div className="dot-pattern" aria-hidden="true" /><img className="hero-photo" src={asset('hero.png')} alt="Woman reviewing color palettes at her desk" /></div>
        </div>
      </section>
      <section id="about" className="about" aria-labelledby="about-heading">
        <div className="container">
          <div className="section-intro"><h2 id="about-heading">Elevate Your Brand Identity</h2><p>Unlock the true potential of your brand. Our passionate team of creative experts is committed to delivering innovative and tailor-made solutions that elevate your brand to new heights.</p></div>
          <div className="about-content">
            <div className="about-photo-wrap"><img className="about-photo" src={asset('about.png')} alt="Creative team collaborating around a computer" /></div>
            <div className="about-text"><p>We believe that a strong brand is the cornerstone of every successful business. We are a passionate team of branding experts dedicated to helping businesses like yours create a unique and compelling brand identity.</p><p>With our extensive experience and deep understanding of brand strategy, design, and storytelling, we collaborate closely with our clients to craft brand experiences that resonate with their target audience. Our goal is to create brands that not only capture attention but also foster trust, loyalty, and recognition.</p></div>
          </div>
        </div>
      </section>
      <section id="services" className="services" aria-labelledby="services-heading"><div className="container"><h2 id="services-heading">Our Services</h2><div className={`services-grid ${showAll ? 'show-all' : ''}`}>{services.map((service, index) => <article className={`service-card ${index > 3 ? 'extra-card' : ''}`} key={service.title}><img src={asset(service.image)} alt="" /><div className="service-shade"/><div className="service-details"><h3><span className="service-icon" aria-hidden="true"><img src={asset(service.icon)} alt="" /></span>{service.title}</h3><button type="button" className="text-button" onClick={demoAction}>Request a quote <Arrow /></button></div></article>)}</div><button className="primary-button view-more" type="button" aria-expanded={showAll} onClick={() => setShowAll(value => !value)}>{showAll ? 'View less' : 'View more'} <Arrow /></button><button className="primary-button quote-button" type="button" onClick={demoAction}>Request a Quote <Arrow /></button></div></section>
    </main>
    {notice && <div className="notice" role="status">{notice}<button type="button" aria-label="Dismiss message" onClick={() => setNotice('')}>×</button></div>}
  </>
}

export default App
