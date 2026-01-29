'use client'

import { useEffect } from 'react'

export function Particles() {
  useEffect(() => {
    const container = document.getElementById('particles-container')
    if (!container) return

    // Detect mobile device
    const isMobile = window.innerWidth <= 768
    const particleCount = isMobile ? 40 : 20 // Molto più particelle su mobile

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div')
      particle.className = 'particle'
      particle.style.left = Math.random() * 100 + '%'
      particle.style.setProperty('--tx', (Math.random() - 0.5) * 300 + 'px')
      // Animazioni più veloci su mobile per maggiore visibilità
      const duration = isMobile ? (10 + Math.random() * 15) : (15 + Math.random() * 20)
      particle.style.animationDuration = duration + 's'
      particle.style.animationDelay = Math.random() * 5 + 's'
      // Forza rendering hardware su mobile
      if (isMobile) {
        particle.style.willChange = 'transform, opacity'
        particle.style.transform = 'translateZ(0)'
      }
      container.appendChild(particle)
    }

    return () => {
      // Cleanup on unmount
      if (container) {
        container.innerHTML = ''
      }
    }
  }, [])

  return <div className="particles-container" id="particles-container" />
}
