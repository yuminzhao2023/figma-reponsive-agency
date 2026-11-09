import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import './lower-page.css'
import { imageProps } from './images'

const asset = (name: string) => `/assets/${name}`

const testimonials = [
  {
    image: 'testimonial-1.png',
    alt: 'Two clients collaborating in a creative workspace',
    quote: 'Their design process is really unique. They collaborated with us on our project. The communication was simple and transparent. They have a talented team of designer who understands the insights very clearly and continues to push their efforts.',
  },
  {
    image: 'testimonial-2.png',
    alt: 'Client sharing feedback on a project',
    quote: 'We’re glad we found this agency to work on our project. They did the complete research and design process for us. They have improved the user experience of our product. We are also looking forward to working on more projects in future.',
  },
  {
    image: 'testimonial-3.png',
    alt: 'Client in a creative office',
    quote: 'Amazing design agency. Amazing team of people. The communication was very clear throughout the project. The designers were very focused and friendly. Highly recommended.',
  },
] as const

// The tablet and mobile designs use this copy for the first slide.
const compactQuote = 'With our extensive experience and deep understanding of brand strategy, design, and storytelling, we collaborate closely with our clients to craft brand experiences that resonate with their target audience. Our goal is to create brands that not only capture attention but also foster trust, loyalty, and recognition.'

const articles = [
  { title: 'Basic rule of running web agency business', image: 'blog-1.png', alt: 'Colleagues celebrating with a high five' },
  { title: 'Understanding different types of Marketing data', image: 'blog-2.png', alt: 'Marketing team reviewing notes on a glass board' },
  { title: 'Understanding the users need to grow your business', image: 'blog-3.png', alt: 'Ideas and notes on a creative planning board' },
] as const

const contactDetails = [
  { title: 'Office Address:', value: '66 Road Broklyn Street, 600', icon: 'location.svg', footerIcon: 'footer-location.svg' },
  { title: 'Contact No', value: '(509) 562-1912', icon: 'phone.svg', footerIcon: 'footer-phone.svg' },
  { title: 'Email', value: 'contact@creativedesign.com', icon: 'email.svg', footerIcon: 'footer-email.svg' },
]

function DesignArrow({ blue = false }: { blue?: boolean }) {
  return <img className="design-arrow" src={asset(blue ? 'arrow-blue.svg' : 'arrow-white.svg')} alt="" />
}

function SectionHeading({ id, children, kind }: { id: string; children: string; kind: string }) {
  return <div className="lower-heading-wrap"><h2 id={id} className={`lower-heading heading-${kind}`}>{children}</h2></div>
}

const testimonialSizes = '(max-width: 600px) 350px, 420px'

function TestimonialCard({ slide, measurement = false }: { slide: number; measurement?: boolean }) {
  const current = testimonials[slide]

  return <div id={measurement ? undefined : 'testimonial-slide'} className={`testimonial-card${measurement ? ' testimonial-measurement' : ''}`} role={measurement ? undefined : 'group'} aria-roledescription={measurement ? undefined : 'slide'} aria-label={measurement ? undefined : `${slide + 1} of ${testimonials.length}`} aria-hidden={measurement || undefined} inert={measurement || undefined}>
    <div className={`testimonial-photo testimonial-photo-${slide + 1}`}>
      {!measurement && <img {...imageProps(current.image, testimonialSizes)} loading="lazy" decoding="async" alt={current.alt} />}
    </div>
    <div className="testimonial-copy">
      {measurement ? <span className="quote-mark" /> : <img className="quote-mark" src={asset('quote-mark.svg')} alt="" />}
      <blockquote className={slide === 0 ? 'desktop-quote' : undefined}>{current.quote}</blockquote>
      {slide === 0 && <blockquote className="compact-quote">{compactQuote}</blockquote>}
    </div>
  </div>
}

function Testimonials() {
  const [slide, setSlide] = useState(0)
  const stage = useRef<HTMLDivElement>(null)
  const activeSlide = useRef(0)
  const requested = useRef({ index: 0, direction: 1 })
  const running = useRef(false)
  const mounted = useRef(false)
  const animations = useRef(new Set<Animation>())
  const committed = useRef<(() => void) | null>(null)

  useLayoutEffect(() => {
    activeSlide.current = slide
    committed.current?.()
    committed.current = null
  }, [slide])

  useEffect(() => {
    mounted.current = true
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const activeAnimations = animations.current
    const stopMotion = () => {
      if (motion.matches) activeAnimations.forEach(animation => animation.cancel())
    }
    motion.addEventListener('change', stopMotion)
    return () => {
      mounted.current = false
      motion.removeEventListener('change', stopMotion)
      activeAnimations.forEach(animation => animation.cancel())
      activeAnimations.clear()
      committed.current?.()
      committed.current = null
    }
  }, [])

  const cancelAnimations = (items: Animation[]) => {
    items.forEach(animation => { animation.cancel(); animations.current.delete(animation) })
  }

  const animateContent = (direction: number, entering: boolean) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return []
    const parts = [
      { selector: '.testimonial-photo', distance: entering ? 18 : -12, duration: entering ? 300 : 140, delay: 0 },
      { selector: '.testimonial-copy', distance: entering ? 12 : -8, duration: entering ? 260 : 110, delay: entering ? 40 : 0 },
    ]
    return parts.flatMap(part => {
      const element = stage.current?.querySelector(`#testimonial-slide ${part.selector}`)
      if (!element) return []
      const neutral = { opacity: 1, transform: 'translateX(0)' }
      const offset = { opacity: 0, transform: `translateX(${part.distance * direction}px)` }
      const animation = element.animate(entering ? [offset, neutral] : [neutral, offset], {
        duration: part.duration,
        delay: part.delay,
        easing: entering ? 'cubic-bezier(.2, .7, .2, 1)' : 'cubic-bezier(.4, 0, 1, 1)',
        fill: 'both',
      })
      animations.current.add(animation)
      return [animation]
    })
  }

  const waitForAnimations = (items: Animation[]) => Promise.allSettled(items.map(animation => animation.finished))

  const drainRequests = async () => {
    if (running.current) return
    running.current = true
    try {
      while (mounted.current && requested.current.index !== activeSlide.current) {
        const target = requested.current
        const source = imageProps(testimonials[target.index].image, testimonialSizes)
        const image = new Image()
        image.decoding = 'async'
        image.sizes = source.sizes
        image.srcset = source.srcSet
        image.src = source.src
        try { await image.decode() } catch { /* Retain the image's accessible fallback if unavailable. */ }
        if (!mounted.current) return
        if (target.index !== requested.current.index) continue

        // Complete each out-in transition; new clicks update the next target.
        const outgoing = animateContent(target.direction, false)
        await waitForAnimations(outgoing)
        if (!mounted.current) return
        await new Promise<void>(resolve => {
          committed.current = resolve
          setSlide(target.index)
        })
        if (!mounted.current) return
        const incoming = animateContent(target.direction, true)
        cancelAnimations(outgoing)
        await waitForAnimations(incoming)
        cancelAnimations(incoming)
      }
    } finally {
      running.current = false
    }
  }

  const selectSlide = (index: number, direction: number) => {
    requested.current = { index, direction }
    void drainRequests()
  }

  const changeSlide = (step: number) => {
    selectSlide((requested.current.index + step + testimonials.length) % testimonials.length, step)
  }

  return <section className="testimonials" aria-labelledby="testimonials-heading" aria-roledescription="carousel">
    <div className="container">
      <SectionHeading id="testimonials-heading" kind="testimonials">Happy stories of our clients</SectionHeading>
      <div className="testimonial-carousel">
        <button type="button" className="slider-control slider-previous" aria-label="Previous testimonial" onClick={() => changeSlide(-1)}><img src={asset('slider-arrow.svg')} alt="" /></button>
        <div ref={stage} className="testimonial-stage">
          {testimonials.map((item, index) => <TestimonialCard key={item.image} slide={index} measurement />)}
          <TestimonialCard slide={slide} />
        </div>
        <button type="button" className="slider-control slider-next" aria-label="Next testimonial" onClick={() => changeSlide(1)}><img src={asset('slider-arrow.svg')} alt="" /></button>
      </div>
      <p className="testimonial-announcement" role="status" aria-live="polite" aria-atomic="true">Testimonial {slide + 1} of {testimonials.length}</p>
      <div className="slider-dots" aria-label="Choose a testimonial">{testimonials.map((item, index) => <button type="button" key={item.image} aria-label={`Show testimonial ${index + 1}`} aria-current={slide === index ? 'true' : undefined} aria-controls="testimonial-slide" onClick={() => selectSlide(index, index > requested.current.index ? 1 : -1)}><img src={asset(slide === index ? 'slider-dot-active.svg' : 'slider-dot.svg')} alt="" /></button>)}</div>
    </div>
  </section>
}

export default function PageSections({ children }: { children: ReactNode }) {
  const [allArticles, setAllArticles] = useState(false)
  const [notice, setNotice] = useState('')
  const [preview, setPreview] = useState({ title: '', body: '' })
  const dialog = useRef<HTMLDialogElement>(null)

  const showPreview = (title: string, body: string) => {
    setPreview({ title, body })
    dialog.current?.showModal()
  }

  const showDemo = (name: string) => setNotice(`Demo only — ${name} is not connected. No data was sent.`)

  const viewAllArticles = () => {
    if (window.matchMedia('(min-width: 1200px)').matches) {
      showPreview('All blog previews', 'All three articles from the design are displayed. This exercise does not include an additional blog archive.')
    } else {
      setAllArticles(value => !value)
    }
  }

  return <>
    <main id="top">
    {children}
    <Testimonials />
    <section id="contact" className="contact-section" aria-labelledby="contact-heading">
      <SectionHeading id="contact-heading" kind="contact">Contact us today</SectionHeading>
      <div className="contact-band"><div className="container contact-layout">
        <div className="contact-details">{contactDetails.map(item => <div className="contact-detail" key={item.title}>
          <h3><span className="contact-icon"><img src={asset(item.icon)} alt="" /></span>{item.title}</h3>
          <p>{item.value}</p>
        </div>)}</div>
        <form className="contact-form" aria-label="Contact request (demo)" aria-describedby="contact-demo" onSubmit={event => { event.preventDefault(); showDemo('contact submission') }}>
          <div className="form-field"><label htmlFor="contact-name">Name<span aria-hidden="true">*</span></label><input id="contact-name" name="name" autoComplete="name" required placeholder="Your name here" /></div>
          <div className="form-field"><label htmlFor="contact-email">Email<span aria-hidden="true">*</span></label><input id="contact-email" name="email" type="email" autoComplete="email" required placeholder="Your email here" /></div>
          <div className="form-field"><label htmlFor="contact-company">Company name</label><input id="contact-company" name="company" autoComplete="organization" placeholder="Company name" /></div>
          <div className="form-field"><label htmlFor="contact-phone">Phone no<span aria-hidden="true">*</span></label><input id="contact-phone" name="phone" type="tel" autoComplete="tel" required placeholder="Phone no" /></div>
          <div className="form-actions"><button className="primary-button" type="submit">Submit <DesignArrow /></button><p id="contact-demo" className="demo-note">Demo form.<br />No message will be sent.</p></div>
        </form>
      </div></div>
    </section>
    <section id="blogs" className="blogs" aria-labelledby="blogs-heading"><div className="container">
      <SectionHeading id="blogs-heading" kind="blogs">Stay updated with blogs</SectionHeading>
      <div id="blog-list" className={`blog-grid ${allArticles ? 'all-articles' : ''}`}>{articles.map((article, index) => <article className={`blog-card ${index === 2 ? 'additional-blog' : ''}`} key={article.title}>
        <img className="blog-cover" {...imageProps(article.image, '(max-width: 600px) calc(100vw - 40px), (max-width: 1199px) max(min(314px, calc((100vw - 100px) / 2)), 315px), 370px')} loading="lazy" decoding="async" alt={article.alt} />
        <div className="blog-copy"><h3>{article.title}</h3><button type="button" className="blog-read-more" onClick={() => showPreview(article.title, 'This is a design exercise preview. The original design includes this article title and cover image, but no article body or destination link has been supplied.')}>Read more <DesignArrow blue /></button></div>
      </article>)}</div>
      <button type="button" className="primary-button blog-view-all" aria-controls="blog-list" aria-expanded={allArticles} onClick={viewAllArticles}>{allArticles ? 'View less' : 'View All'} <DesignArrow /></button>
    </div></section>
    </main>
    <footer className="site-footer"><div className="container">
      <div className="footer-grid">
        <div className="footer-brand"><a className="footer-logo" href="#top" aria-label="Creative Design Agency, back to top"><img {...imageProps('footer-logo.png', '(max-width: 1199px) 91px, 102px')} loading="lazy" decoding="async" alt="Creative Design Agency" /></a><div className="social-links" aria-label="Social media (demo)">{['dribbble', 'behance', 'instagram', 'linkedin'].map(name => <button key={name} type="button" aria-label={`${name} (demo)`} onClick={() => showDemo(`${name} profile`)}><img src={asset(`${name}.svg`)} alt="" /></button>)}</div></div>
        <div className="footer-contact"><h3>Contact</h3><address>{contactDetails.map(item => <p key={item.title}><img src={asset(item.footerIcon)} alt="" /><span>{item.value}</span></p>)}</address></div>
        <nav className="footer-explore" aria-label="Explore"><h3>Explore</h3><a href="#about">About</a>{['Our Team', 'Shop', 'Career'].map(name => <button type="button" key={name} onClick={() => showDemo(`${name} page`)}>{name}</button>)}<a href="#blogs">Blog</a></nav>
        <form className="newsletter" aria-label="Newsletter subscription (demo)" onSubmit={event => { event.preventDefault(); showDemo('newsletter subscription') }}>
          <h3>Subscribe to our Newsletter</h3><div className="form-field"><label htmlFor="newsletter-email">Email<span aria-hidden="true">*</span></label><input id="newsletter-email" name="newsletter-email" type="email" autoComplete="email" required placeholder="Your email here" /></div>
          <p className="newsletter-terms">By subscribing you agree to our <button type="button" onClick={() => showPreview('Terms & Conditions', 'Demo only. This exercise does not collect personal data or create subscriptions. No legal terms have been supplied with the original design.')}>Terms &amp; Conditions</button></p>
          <div className="newsletter-actions"><button className="primary-button" type="submit">Subscribe <DesignArrow /></button><span className="demo-note">Demo only</span></div>
        </form>
      </div>
      <p className="copyright">© 2023 Creative Design Agency, All Rights Reserved</p>
    </div></footer>
    <dialog ref={dialog} className="preview-dialog" aria-labelledby="preview-title"><div className="preview-dialog-content"><h2 id="preview-title">{preview.title}</h2><p>{preview.body}</p><button className="primary-button" type="button" onClick={() => dialog.current?.close()}>Close</button></div></dialog>
    {notice && <div className="notice" role="status">{notice}<button type="button" aria-label="Dismiss message" onClick={() => setNotice('')}>×</button></div>}
  </>
}
