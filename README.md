# JUTSU

Next.js frontend for a multilingual Korea newcomer marketplace.

JUTSU currently works before Django is ready:

- `next-intl` locale routing for Uzbek, Russian, English, and Korean
- compact city/search/catalog UX with a custom JUTSU logo
- large Korea city registry in the city selector
- login/register demo flow for future auth integration
- product detail modal, order flow, and checkout UI
- Korea-oriented payment options: card, Toss Payments, Naver Pay, Kakao Pay, bank transfer, cash on pickup
- Django adapter that activates through `DJANGO_API_URL`

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3001/uz` if port `3000` is already busy.

## Routes

```txt
/uz
/ru
/en
/ko
/api/catalog?lang=uz&city=seoul
```

## Django API Contract

Create `.env.local` when the backend is ready:

```bash
DJANGO_API_URL=http://localhost:8000
```

The frontend calls:

```txt
GET /api/products/?city=seoul&lang=uz
GET /api/restaurants/?city=seoul&lang=uz
GET /api/guides/?city=seoul&lang=uz
```

Expected product fields:

```ts
{
  id: string
  name: string
  city: string
  price_krw: number
  image?: string
  seller_name?: string
  contact?: string
  verified?: boolean
}
```

Expected restaurant fields:

```ts
{
  id: string
  name: string
  city: string
  address?: string
  image?: string
  contact?: string
  rating?: number
  halal?: boolean
}
```

## Future API Options

```bash
KAKAO_REST_API_KEY=...
KTO_SERVICE_KEY=...
```

Kakao Local can power place search. Korea TourAPI can add official restaurant and travel data.

## Payment Notes

The current checkout is a frontend contract. For production, use a backend order endpoint and connect a real payment gateway.

Recommended Korea payment path:

1. Start with Toss Payments Widget for card and easy-pay UI.
2. Keep Naver Pay and Kakao Pay as quick payment options.
3. Keep bank transfer and cash-on-pickup for users who cannot pay online yet.
4. Store payment intent and order state in Django before redirecting to a PG.
