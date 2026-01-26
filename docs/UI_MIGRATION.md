# UI Migration Plan - Black & Gold Theme

## Componenti Esistenti da Migrare
- [ ] app/dashboard/page.tsx
- [ ] app/admin/page.tsx
- [ ] app/login/page.tsx
- [ ] components/BookingForm.tsx
- [ ] components/BookingsList.tsx
- [ ] components/CreateUserModal.tsx
- [ ] components/CreatePackageModal.tsx
- [ ] components/AdminUsersList.tsx
- [ ] components/AdminPackagesList.tsx

## Strategia di Migrazione
1. Creare componenti UI base (Button, Card, Input, Badge)
2. Migrare dashboard cliente
3. Migrare admin panel
4. Migrare modali
5. Testing e refinement

## Breaking Changes
- Background: da white a dark-950
- Text: da black a white/gold
- Font display: aggiunta Playfair Display
- Nuove animazioni: shimmer, glow
- Palette colori: da primary blue a gold/dark

## Rollback Plan
- Branch separato: `feature/black-gold-ui`
- Commit atomici per ogni fase
- Tag prima di merge: `v1.0-before-redesign`

## Note Implementazione
- Accessibilità WCAG AA: contrasti verificati
- Performance: animazioni GPU-accelerated
- Mobile-first: breakpoints responsive
- Testing: test accessibilità e performance
