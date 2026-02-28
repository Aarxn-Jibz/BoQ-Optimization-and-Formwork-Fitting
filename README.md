# Kit-Optima Dashboard

## Introduction
Kit-Optima is a web-based optimization dashboard designed to calculate and display the most efficient kitting requirements for construction formwork (BoQ). The application consists of a React frontend that visualizes kitting performance, ESG metrics, and timelines, and a high-performance Go backend engine that rapidly processes bulk input data to compute reuse factors, cost savings, and optimized kit counts.

## Technologies
- React 18
- Vite
- Recharts
- Lucide React
- CSS Custom Properties
- Go
- Fiber (Go web framework)

## Setup & Usage

1. **Start the Go Backend Engine:**
   Open a terminal and navigate to the backend directory:
   ```bash
   cd algorithm
   go run .
   ```
   The backend will start running on `localhost:3000`.

2. **Start the React Frontend:**
   Open a separate terminal and navigate to the project root:
   ```bash
   npm install
   npm start
   ```
   The frontend will be accessible in your browser and automatically connect to the backend engine.

3. **Build for production:**
   To create an optimized production build of the frontend:
   ```bash
   npm run build
   ```
