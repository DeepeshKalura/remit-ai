# RemitAI Deployment Guide

## Quick Start

### 1. Deploy Frontend to Vercel

\`\`\`bash
# Install dependencies
npm install

# Build the project
npm run build

# Deploy to Vercel (if you have Vercel CLI installed)
vercel deploy

# Or connect your GitHub repo to Vercel dashboard for auto-deployment
\`\`\`

### 2. Run Backend Locally (Development)

\`\`\`bash
cd backend-setup

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Add your API keys:
# CARDANO_BLOCKFROST_API_KEY=your_key
# OPENAI_API_KEY=your_key

# Run backend
python main.py
\`\`\`

The backend will run on `http://localhost:5000`

### 3. Environment Variables Setup

#### Frontend (.env.local)
\`\`\`
NEXT_PUBLIC_CREWAI_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_MASUMI_TESTNET=true
\`\`\`

#### Backend (.env)
\`\`\`
CARDANO_BLOCKFROST_API_KEY=your_blockfrost_testnet_key
CARDANO_NETWORK=testnet
MASUMI_API_KEY=your_masumi_testnet_key
MASUMI_TESTNET=true
OPENAI_API_KEY=your_openai_key
HOST=0.0.0.0
PORT=5000
DEBUG=false
\`\`\`

## Production Deployment

### Frontend

1. Push code to GitHub
2. Connect repo to Vercel
3. Vercel will auto-deploy on push to main
4. Configure environment variables in Vercel dashboard

### Backend

#### Option A: Heroku (Simple)
\`\`\`bash
# Create Procfile in backend-setup/
echo "web: python main.py" > backend-setup/Procfile

# Deploy
git push heroku main
\`\`\`

#### Option B: AWS Lambda (Serverless)
- Use AWS Chalice to deploy Python functions
- Connect to API Gateway
- Set environment variables in Lambda

#### Option C: DigitalOcean (VPS)
\`\`\`bash
# SSH into droplet
ssh root@your_server_ip

# Clone repository
git clone https://github.com/your-username/remitai.git

# Set up backend
cd remitai/backend-setup
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env file with production keys
nano .env

# Run with Gunicorn for production
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 main:server
\`\`\`

## Testing Before Deploy

\`\`\`bash
# Run E2E tests
npm run test:e2e

# Run frontend tests
npm test

# Check backend health
curl http://localhost:5000/health
\`\`\`

## Monitoring & Maintenance

### Frontend
- Monitor with Vercel Analytics
- Set up error tracking (Sentry)
- Check Core Web Vitals

### Backend
- Log with Cloudwatch or similar
- Monitor Blockfrost API usage
- Track Masumi transaction success rate
- Set up alerts for failures

## Security Checklist

- [ ] Use HTTPS everywhere
- [ ] Store API keys in environment variables
- [ ] Enable CORS only for trusted domains
- [ ] Rate limit API endpoints
- [ ] Add authentication for admin endpoints
- [ ] Regularly update dependencies
- [ ] Use testnet for development
- [ ] Don't commit .env files
- [ ] Enable 2FA on all platform accounts
