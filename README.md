# JUTSU

Next.js frontend for a multilingual Korea newcomer platform.

JUTSU currently works before Django is ready:

- large Korea city registry in the city selector
- city-aware fallback restaurants and starter guides
- DummyJSON no-key product API for demo tech cards
- TheMealDB no-key food API for food radar
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
