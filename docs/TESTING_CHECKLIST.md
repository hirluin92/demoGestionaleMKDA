# Testing Checklist - Black & Gold UI

## Accessibility (WCAG 2.1 Level AA)

### Color Contrast
- [ ] Text gold-400 on dark-950: >= 7:1 ratio (AAA)
- [ ] Text dark-600 on dark-950: >= 4.5:1 ratio (AA)
- [ ] Text dark-500 on dark-950: >= 4.5:1 ratio (AA)
- [ ] Accent colors on dark-950: >= 4.5:1 ratio (AA)

### Keyboard Navigation
- [ ] Tab order logico (top to bottom, left to right)
- [ ] Focus indicators visibili (ring-2 ring-gold-400)
- [ ] Skip to main content link (opzionale)
- [ ] Tutti i buttons raggiungibili via keyboard
- [ ] Modali chiudibili con ESC

### Screen Reader
- [ ] Landmark regions (nav, main, footer)
- [ ] Headings gerarchici (h1 > h2 > h3)
- [ ] Alt text su tutte le immagini
- [ ] ARIA labels su icon-only buttons
- [ ] Form labels associati a inputs
- [ ] Error messages annunciati (aria-live)
- [ ] Loading states annunciati (aria-busy)

### Motion & Animations
- [ ] `prefers-reduced-motion` rispettato
- [ ] Animazioni disabilitabili
- [ ] Nessuna animazione critica per funzionalità

## Performance

### Lighthouse Scores (Target)
- [ ] Performance: >= 90
- [ ] Accessibility: >= 95
- [ ] Best Practices: >= 90
- [ ] SEO: >= 90

### Bundle Size
- [ ] First Load JS: < 200 KB
- [ ] Largest Contentful Paint (LCP): < 2.5s
- [ ] First Input Delay (FID): < 100ms
- [ ] Cumulative Layout Shift (CLS): < 0.1

### Fonts
- [ ] Preload critical fonts
- [ ] Subset fonts (solo Latin)
- [ ] Font-display: swap
- [ ] Fallback fonts definiti

### Animations
- [ ] will-change applicato
- [ ] GPU acceleration (translateZ)
- [ ] Nessun jank (60fps)

## Responsive Design

### Breakpoints
- [ ] Mobile (320px - 640px)
- [ ] Tablet (640px - 1024px)
- [ ] Desktop (1024px+)

### Touch Targets
- [ ] Min 44x44px su mobile
- [ ] Spacing adeguato tra elementi
- [ ] No hover-only interactions

### Typography
- [ ] Font sizes responsive
- [ ] Line height adeguato
- [ ] No testo < 16px su mobile (zoom issues)

## Cross-Browser

### Desktop
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile
- [ ] iOS Safari
- [ ] Chrome Android
- [ ] Samsung Internet

## Functional Testing

### User Flows
- [ ] Login
- [ ] Visualizzazione pacchetti
- [ ] Selezione data
- [ ] Selezione orario
- [ ] Conferma prenotazione
- [ ] Cancellazione prenotazione
- [ ] Logout

### Error Handling
- [ ] Messaggi di errore chiari
- [ ] Error boundary funzionante
- [ ] Fallback per API failures
- [ ] Network offline handling

### Loading States
- [ ] Skeleton screens/spinners
- [ ] Disabilitazione durante loading
- [ ] Timeout handling
