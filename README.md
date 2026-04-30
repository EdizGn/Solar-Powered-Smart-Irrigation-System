# Solar Smart Irrigation Dashboard — Web UI

Frontend web dashboard for the **Solar-Powered Smart Irrigation System**.
CENG318 Microprocessors — 2025-2026 Spring | Team Member: Şevval Özik

---

## Features

- Real-time sensor monitoring (soil moisture, temperature, humidity, rain, battery, Wi-Fi)
- AI-based irrigation decision display (irrigate / skip / standby / monitoring)
- Manual pump control with session timer
- Water consumption reports (daily / weekly / monthly charts)
- Irrigation history with filters and sorting
- Notification system with severity levels (info / success / warning / danger)
- System settings with configurable thresholds
- System health monitoring and fault log

## Tech Stack

- **React** (Vite) + functional components and hooks
- **Tailwind CSS** — styling
- **Recharts** — charts and data visualization
- **React Router** — client-side routing
- **Lucide React** — icons

## Setup

```bash
npm install
npm run dev
```

Login: `admin` / `admin123`

## Note

Currently uses mock data. Ready for backend integration — all API touchpoints are marked with `// TODO: Replace with API call` comments.

## CI/CD and Branch Protection (TDR §17.3)

GitHub repository üzerinde `main` branch için aşağıdaki branch protection (koruma) kurallarının manuel olarak aktifleştirilmesi gereklidir:
- **Require pull request reviews before merging**: En az 1 onay (approving review)
- **Require status checks to pass before merging**: `build-and-lint` action'ının (frontend-ci.yml) başarılı olması zorunlu
- **Do not allow bypassing the above settings**: Yöneticiler dahil kimse doğrudan `main`'e push atamaz.
