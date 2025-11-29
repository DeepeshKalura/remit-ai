# RemitAI - AI-Powered Remittances on Cardano

**Send international remittances instantly with AI-optimized routing and Cardano blockchain security.**

## Features

- 🤖 **AI Chat Assistant** - Ask questions about rates, fees, and get remittance guidance
- 💱 **Live DEX Aggregation** - Real-time rates from Minswap and SundaeSwap
- 📊 **Analytics Dashboard** - Track volume, destinations, and transaction trends
- 💼 **Wallet Integration** - Connect Nami, Eternl, or Flint wallets (CIP-30)
- ⚡ **Masumi Testnet** - Instant settlement to 100+ countries
- 🔐 **Blockchain Secured** - Transactions on Cardano testnet
- 📱 **Mobile First** - Responsive design optimized for emerging markets

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10 > 3.14 (for backend)
- Cardano wallet (Nami, Eternl, or Flint)

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Run backend
python src/main.py
```

Backend runs on `http://localhost:5000`

## Architecture

```
RemitAI
├── Frontend (Next.js 16)
│   ├── Chat Interface
│   ├── DEX Rates Display
│   ├── Remittance Form
│   ├── Transaction History
│   ├── Analytics Dashboard
│   └── Settings
├── Backend (Python/CrewAI)
│   ├── DEX Analyzer Agent
│   ├── Rate Optimizer Agent
│   ├── Blockfrost Integration
│   └── Masumi Integration
└── Blockchain
    ├── Cardano Testnet
    ├── Nami/Eternl/Flint Wallets
    └── CIP-30 Standard
```

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Python, CrewAI, Blockfrost API
- **Blockchain**: Cardano Testnet
- **Integrations**: Masumi (testnet), DEX APIs
- **Deployment**: Vercel (frontend), Python hosting (backend)

## Key Workflows

### 1. Wallet Connection
1. Click "Connect Wallet"
2. Select wallet (Nami/Eternl/Flint)
3. Approve connection
4. View balance and address

### 2. Send Remittance
1. Enter amount in ADA
2. Select recipient country
3. Get live quote
4. Enter recipient phone
5. Sign with wallet
6. Submit to Masumi
7. Receive confirmation

### 3. Track Transaction
1. View transaction history
2. Check blockchain status
3. Verify settlement

## API Endpoints

### Frontend API Routes (/app/api)
- `POST /masumi/quote` - Get remittance quote
- `POST /masumi/transaction` - Create transaction
- `POST /masumi/payment` - Submit payment
- `GET /masumi/status` - Check transaction status

### Backend API Routes (/backend-setup)
- `POST /api/analyze` - DEX rate analysis
- `POST /api/optimize` - Route optimization
- `POST /api/quote` - Create Masumi quote
- `GET /api/rates` - Aggregated rates
- `GET /api/status` - Transfer status
- `GET /health` - Health check

## Configuration

### Environment Variables

**Frontend (.env.local)**
```
NEXT_PUBLIC_CREWAI_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_MASUMI_TESTNET=true
```

**Backend (.env)**
```
CARDANO_BLOCKFROST_API_KEY=your_key
CARDANO_NETWORK=testnet
MASUMI_API_KEY=your_key
OPENAI_API_KEY=your_key
```


## Deployment

### Vercel (Frontend)
1. Push to GitHub
2. Connect to Vercel
3. Auto-deploys on push

### Backend Options
- **Heroku**: Simple deployment with Procfile
- **AWS Lambda**: Serverless with Chalice
- **DigitalOcean**: VPS with Gunicorn

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for details.

## Demo Video

[Watch RemitAI Demo on YouTube](#)

For creating your own demo, see [DEMO_VIDEO_GUIDE.md](DEMO_VIDEO_GUIDE.md)

## Supported Countries

- Philippines (PHP)
- Vietnam (VND)
- India (INR)
- Mexico (MXN)
- Kenya (KES)

*More countries coming soon*

## Security

- CIP-30 wallet standard
- Cardano testnet
- Masumi testnet integration
- 2FA support
- Environment variable management
- No private key storage in app

## Roadmap

- [ ] Mainnet deployment
- [ ] Multi-currency support
- [ ] Mobile app (React Native)
- [ ] KYC/AML compliance
- [ ] Advanced AI agents
- [ ] Automated routing optimization
- [ ] Fiat on/off ramps
- [ ] Community features

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built with Next.js, React, and Tailwind CSS
- Cardano ecosystem
- Masumi for payment infrastructure
- CrewAI for agent orchestration

---

**Made with 💜 for the Cardano community**

