# Flipkart Clone - E-Commerce Platform

A full-stack e-commerce web application that closely replicates Flipkart's design and user experience.

## Live Demo

Deployed on Replit. See the deployed URL in the submission.

## Tech Stack

- **Frontend**: React.js + Vite (SPA), TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Node.js + Express.js (Express 5)
- **Database**: PostgreSQL + Drizzle ORM
- **API Contract**: OpenAPI 3.1 spec with Orval code generation
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter
- **Form Handling**: React Hook Form + Zod validation
- **Build Tool**: pnpm workspaces (monorepo)

## Features Implemented

### Core Features
1. **Product Listing Page**
   - Grid layout matching Flipkart's design
   - Product cards with image, rating, price, and discount badge
   - Search functionality by product name
   - Filter by category (horizontal category pills)

2. **Product Detail Page**
   - Image carousel using Embla Carousel
   - Product description and specifications table
   - Price, original price, and discount percentage
   - Stock availability status
   - "Add to Cart" and "Buy Now" buttons

3. **Shopping Cart**
   - View all added items with images
   - Update quantity with +/- controls
   - Remove individual items
   - Cart summary with subtotal and total
   - Empty cart state

4. **Order Placement**
   - Checkout page with shipping address form (validated with Zod)
   - Payment method selection (Cash on Delivery, UPI, Credit/Debit Card)
   - Order summary review
   - Place order functionality
   - Order confirmation page with order ID and expected delivery date

### Bonus Features
- Responsive design (mobile, tablet, desktop)
- Order history page with status badges
- Flipkart-style UI with blue (#2874F0) primary color
- Trending Offers section on homepage
- Category-based filtering
- Real-time cart item count in navbar

## Database Schema

### Tables

**products**
- id (PK), name, description, price, original_price, discount_percent
- category, brand, rating, review_count, stock
- images (array), specifications (JSONB), is_featured
- created_at

**cart_items**
- id (PK), product_id (FK → products), quantity, created_at

**orders**
- id (PK), order_number (unique), status, shipping_address (JSONB)
- subtotal, total, payment_method, created_at

**order_items**
- id (PK), order_id (FK → orders), product_id
- quantity, price_at_purchase, product_name, product_image

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/products | List products (search, category, pagination) |
| GET | /api/products/featured | Get featured/trending products |
| GET | /api/products/:id | Get product by ID |
| GET | /api/categories | List all categories |
| GET | /api/cart | Get cart items |
| POST | /api/cart | Add item to cart |
| PUT | /api/cart/:productId | Update cart item quantity |
| DELETE | /api/cart/:productId | Remove from cart |
| DELETE | /api/cart | Clear entire cart |
| GET | /api/orders | List all orders |
| POST | /api/orders | Place new order |
| GET | /api/orders/:id | Get order by ID |

## Setup Instructions

### Prerequisites
- Node.js 20+
- pnpm 9+
- PostgreSQL database (or use Replit's built-in database)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd flipkart-clone

# Install all dependencies
pnpm install

# Set up environment variables
# Create a .env file or set these in your environment:
# DATABASE_URL=postgresql://user:password@host:5432/dbname

# Push database schema
pnpm --filter @workspace/db run push

# Start the API server
pnpm --filter @workspace/api-server run dev

# Start the frontend (in another terminal)
pnpm --filter @workspace/flipkart-clone run dev
```

### Seeding Sample Data
The database is pre-seeded with 20 sample products across 9 categories:
- Electronics (phones, headphones, TV)
- Computers (laptops)
- Footwear (Nike, Adidas)
- Clothing (Levi's jeans)
- Watches (Titan, Fossil)
- Kitchen (Instant Pot, Prestige mixer)
- Home Appliances (Dyson, Bajaj heater)
- Food & Grocery (Nescafe coffee)
- Bags (Wildcraft backpack)
- Home & Furniture (Philips LED)

## Assumptions

1. **Default User**: The app assumes "Rahul Kumar" is always logged in (no auth flow required)
2. **Cart Persistence**: Cart is stored in the database (server-side), not in localStorage
3. **Images**: Product images are sourced from Unsplash (free stock photos)
4. **Payment**: Payment methods are simulated (no actual payment gateway)
5. **Single User**: The app is designed for a single default user (no multi-user cart isolation)
6. **Order Status**: Orders are immediately set to "confirmed" status upon placement

## Project Structure

```
├── artifacts/
│   ├── api-server/          # Express.js API server
│   │   └── src/
│   │       └── routes/      # API route handlers
│   └── flipkart-clone/      # React + Vite frontend
│       └── src/
│           ├── pages/       # Page components
│           └── components/  # Reusable UI components
├── lib/
│   ├── api-spec/            # OpenAPI specification
│   ├── api-client-react/    # Generated React Query hooks
│   ├── api-zod/             # Generated Zod validation schemas
│   └── db/                  # Drizzle ORM + PostgreSQL schema
└── README.md
```
