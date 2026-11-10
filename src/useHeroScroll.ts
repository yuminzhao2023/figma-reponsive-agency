import { useLayoutEffect } from 'react'
import type { RefObject } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const photoMotion = {
  initialSpeed: 1.2, // Photo travel in the viewport per pixel of page scrolling.
  maxLift: 64, // Maximum extra lift relative to the hero, in pixels.
  slowDownAfter: 0, // Scroll distance after pinning before deceleration starts.
  decelerationPower: 3, // Cubic ease-out: larger values give a longer, softer tail.
}

export function useHeroScroll(hero: RefObject<HTMLElement | null>, cover: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const panel = hero.current
    const nextPanel = cover.current
    const photo = panel?.querySelector<HTMLImageElement>('.hero-photo')
    if (!panel || !nextPanel || !photo) return

    const media = gsap.matchMedia()
    media.add('(min-width: 1200px) and (prefers-reduced-motion: no-preference)', () => {
      panel.classList.add('hero-scroll-panel')
      nextPanel.classList.add('hero-cover-panel')

      // Keep normal document spacing: the white section scrolls over the pinned hero.
      const pin = ScrollTrigger.create({
        trigger: panel,
        start: 'top top',
        end: () => `+=${panel.offsetHeight}`,
        pin: true,
        pinSpacing: false,
        invalidateOnRefresh: true,
      })

      const travel = { scroll: 0 }
      gsap.set(photo, { y: 0 })
      const setPhotoY = gsap.quickSetter(photo, 'y', 'px')
      gsap.fromTo(travel, { scroll: 0 }, {
        scroll: () => pin.end,
        ease: 'none',
        onUpdate: () => {
          // Compensate for natural scrolling before pinning, then ease into a stop.
          // Match the ease's initial slope to the fast phase to avoid a speed jump.
          const panelTravel = Math.min(travel.scroll, pin.start)
          const slowDownStart = pin.start + photoMotion.slowDownAfter
          const fastLift = slowDownStart * photoMotion.initialSpeed - pin.start
          const remainingLift = Math.max(0, photoMotion.maxLift - fastLift)
          const slowDownDistance = remainingLift * photoMotion.decelerationPower / photoMotion.initialSpeed
          const progress = gsap.utils.clamp(0, 1, (travel.scroll - slowDownStart) / Math.max(1, slowDownDistance))
          const eased = 1 - Math.pow(1 - progress, photoMotion.decelerationPower)
          const lift = travel.scroll <= slowDownStart
            ? travel.scroll * photoMotion.initialSpeed - panelTravel
            : fastLift + remainingLift * eased
          setPhotoY(-Math.min(photoMotion.maxLift, lift))
        },
        scrollTrigger: {
          trigger: panel,
          start: 0,
          end: () => pin.end,
          scrub: true,
          invalidateOnRefresh: true,
        },
      })

      // Preserve the photo's original overhang at rest, then close it as scrolling starts.
      gsap.fromTo(nextPanel, {
        '--hero-cover-inset': () => `${Math.max(0, photo.offsetTop + photo.offsetHeight - panel.offsetHeight)}px`,
      }, {
        '--hero-cover-inset': '0px',
        ease: 'none',
        scrollTrigger: {
          trigger: panel,
          start: 0,
          end: () => Math.max(1, pin.start),
          scrub: true,
          invalidateOnRefresh: true,
        },
      })

      return () => {
        panel.classList.remove('hero-scroll-panel')
        nextPanel.classList.remove('hero-cover-panel')
      }
    })

    return () => media.revert()
  }, [hero, cover])
}
