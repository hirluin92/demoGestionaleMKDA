'use client'

export function ParallaxBackground() {
  return (
    <div className="parallax-container" id="parallax-container">
      <div 
        className="parallax-layer parallax-layer-1" 
        style={{
          backgroundImage: "url('/sfondo.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 1
        }}
      />
      <div className="parallax-layer parallax-layer-2" />
      <div className="parallax-layer parallax-layer-3" />
    </div>
  )
}
