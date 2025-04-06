# Ride With Vic

A premium ride tracking application for Tesla vehicles. Track your rides, get fare estimates, and create receipts.

## Features

- Tesla Fleet API integration
- Real-time vehicle tracking 
- Trip management
- Fare estimation
- Receipt generation
- Location history
- Customer management

## System Requirements

- Node.js 18.x or higher
- npm 8.x or higher
- Docker (optional, for containerized deployment)

## Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/ride-with-vic-app.git
   cd ride-with-vic-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Variables**

   Create a `.env.local` file in the root directory with the following variables:

   ```
   NEXT_PUBLIC_TESLA_CLIENT_ID=your_tesla_client_id
   NEXT_PUBLIC_TESLA_REDIRECT_URI=http://localhost:3000/api/auth/callback
   NEXT_PUBLIC_TESLA_API_BASE_URL=https://owner-api.teslamotors.com
   NEXT_PUBLIC_TESLA_AUTH_URL=https://auth.tesla.com/oauth2/v3
   TESLA_PRIVATE_KEY=your_base64_encoded_private_key
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The application will be available at [http://localhost:3000](http://localhost:3000)

## Running with Docker

1. **Build the Docker image**

   ```bash
   npm run docker-build
   ```

2. **Run the Docker container**

   ```bash
   npm run docker-run
   ```

   The application will be available at [http://localhost:3000](http://localhost:3000)

## Deployment

### Vercel Deployment

1. **Install Vercel CLI**

   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel**

   ```bash
   vercel deploy --prod
   ```

## Code Structure

```
RIDE-WITH-VIC-APP
├── api/                      # API routes (Vercel serverless functions)
│   ├── auth/                 # Authentication endpoints
│   ├── vehicle/              # Vehicle-related endpoints
│   └── trip/                 # Trip management endpoints
├── components/               # React components
│   ├── layout/               # Layout components
│   ├── customer/             # Customer-related components
│   ├── trip/                 # Trip tracking components
│   ├── vehicle/              # Vehicle-related components
│   └── receipt/              # Receipt/PDF generation components
├── lib/                      # Shared utilities
├── models/                   # Data models
├── pages/                    # Next.js pages
├── public/                   # Static assets
└── styles/                   # CSS styles
```

## Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application
- `npm start` - Start the production server
- `npm run lint` - Run linting
- `npm run lint:fix` - Fix linting issues
- `npm run test` - Run tests
- `npm run docker-build` - Build Docker image
- `npm run docker-run` - Run Docker container
- `npm run tesla-api-test` - Test Tesla API integration

## Tesla API Integration

The application integrates with the Tesla Fleet API. To test the integration, run:

```bash
npm run tesla-api-test
```

## Linting & Code Quality

To ensure code quality, run:

```bash
npm run lint
```

To automatically fix issues:

```bash
npm run lint:fix
```

## License

MIT 