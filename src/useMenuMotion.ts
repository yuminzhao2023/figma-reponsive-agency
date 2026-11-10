import { useLayoutEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { gsap } from 'gsap'

const menuMotion = {
  duration: 0.38,
  exitSpeed: 1.6,
  startScale: 0.94,
  offsetY: -10,
  enterEase: 'back.out(1.4)',
  exitEase: 'power3.out',
  itemDuration: 0.22,
  itemStagger: 0.03,
  itemOffsetX: -7,
}

export function useMenuMotion(panel: RefObject<HTMLElement | null>, open: boolean) {
  const update = useRef<((value: boolean) => void) | null>(null)

  useLayoutEffect(() => {
    const element = panel.current
    if (!element) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let desiredOpen = element.dataset.state === 'open'
    let apply: (value: boolean) => void

    const context = gsap.context(() => {
      gsap.set(element, { autoAlpha: 0, y: menuMotion.offsetY, yPercent: 0, scale: menuMotion.startScale })
      const timeline = gsap.timeline({ paused: true })
        .to(element, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: menuMotion.duration,
          ease: menuMotion.enterEase,
          easeReverse: menuMotion.exitEase,
        }, 0)
        .fromTo(element.querySelectorAll('a'), { opacity: 0, x: menuMotion.itemOffsetX }, {
          opacity: 1,
          x: 0,
          duration: menuMotion.itemDuration,
          stagger: menuMotion.itemStagger,
          ease: 'power2.out',
          easeReverse: 'power2.out',
        }, 0.025)

      apply = value => {
        desiredOpen = value
        if (motion.matches) {
          timeline.pause().progress(value ? 1 : 0, true)
        } else if (value) {
          timeline.timeScale(1).play()
        } else {
          timeline.timeScale(menuMotion.exitSpeed).reverse()
        }
      }
      update.current = apply
      apply(desiredOpen)
    })

    const onMotionChange = () => apply(desiredOpen)
    motion.addEventListener('change', onMotionChange)
    return () => {
      motion.removeEventListener('change', onMotionChange)
      update.current = null
      context.revert()
    }
  }, [panel])

  useLayoutEffect(() => {
    update.current?.(open)
  }, [open])
}
