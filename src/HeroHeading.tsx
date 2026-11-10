import { useLayoutEffect, useRef } from 'react'

export default function HeroHeading() {
  const heading = useRef<HTMLHeadingElement>(null)
  const original = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const element = heading.current
    const source = original.current
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const desktop = window.matchMedia('(min-width: 1200px)')
    if (!element || !source || !desktop.matches || motion.matches || typeof element.animate !== 'function') return

    const animations: Animation[] = []
    const overlay = document.createElement('span')
    overlay.className = 'hero-heading-overlay'
    overlay.setAttribute('aria-hidden', 'true')
    const initialWidth = window.innerWidth
    let finished = false

    const restoreText = () => {
      animations.forEach(animation => animation.cancel())
      overlay.remove()
    }
    const finish = () => {
      if (finished) return
      finished = true
      restoreText()
      element.removeAttribute('data-animating')
      motion.removeEventListener('change', onMotionChange)
      window.removeEventListener('resize', onResize)
      element.removeEventListener('animationend', onUnderlineEnd)
    }
    const onMotionChange = () => { if (motion.matches) finish() }
    const onResize = () => { if (window.innerWidth !== initialWidth) finish() }
    const onUnderlineEnd = (event: AnimationEvent) => {
      if (event.animationName === 'hero-underline-reveal') finish()
    }

    element.setAttribute('data-animating', 'text')
    motion.addEventListener('change', onMotionChange)
    window.addEventListener('resize', onResize)
    element.addEventListener('animationend', onUnderlineEnd)

    const start = () => {
      if (finished) return
      try {
        // The original text always controls layout, kerning, wrapping and accessibility.
        // Only this decorative overlay moves, using measured browser text positions.
        const origin = element.getBoundingClientRect()
        const walker = document.createTreeWalker(source, NodeFilter.SHOW_TEXT)
        const range = document.createRange()
        const characters: HTMLSpanElement[] = []
        while (walker.nextNode()) {
          const text = walker.currentNode as Text
          let offset = 0
          for (const character of Array.from(text.data)) {
            const start = offset
            offset += character.length
            if (!character.trim()) continue
            range.setStart(text, start)
            range.setEnd(text, offset)
            const bounds = range.getBoundingClientRect()
            const span = document.createElement('span')
            span.className = 'hero-heading-character'
            span.textContent = character
            span.style.left = `${bounds.left - origin.left}px`
            span.style.top = `${bounds.top - origin.top}px`
            span.style.lineHeight = `${bounds.height}px`
            characters.push(span)
            overlay.append(span)
          }
        }
        element.append(overlay)
        characters.forEach((character, index) => {
          animations.push(character.animate([
            { opacity: 0, transform: 'translateY(80px) rotateX(180deg) scale(0)' },
            { opacity: 1, transform: 'translateY(0) rotateX(0deg) scale(1)' },
          ], {
            duration: 1000,
            delay: 120 + index * 28,
            easing: 'cubic-bezier(.175, .885, .32, 1.275)',
            fill: 'both',
          }))
        })
        void Promise.allSettled(animations.map(animation => animation.finished)).then(() => {
          if (finished) return
          restoreText()
          element.setAttribute('data-animating', 'underline')
        })
      } catch {
        finish()
      }
    }

    void document.fonts.ready.then(start, finish)
    return finish
  }, [])

  return <h1 ref={heading} id="hero-heading"><span ref={original} className="hero-heading-original">Crafting <span className="underlined">Visual</span> Stories: Unleashing Creative Essence</span></h1>
}
