'use client'

export function ParallaxBackground() {
  return (
    <div className="parallax-container" id="parallax-container">
      <div 
        className="parallax-layer parallax-layer-1" 
        style={{
          backgroundImage: "url('/sfondo3.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          imageRendering: 'auto',
          opacity: 1,
          willChange: 'transform'
        } as React.CSSProperties}
      />
      <div className="parallax-layer parallax-layer-2" />
      <div className="parallax-layer parallax-layer-3" />
    </div>
  )
}
