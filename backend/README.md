# RemitAI Python Backend Setup

This folder contains the Python/CrewAI backend for RemitAI that handles advanced AI agent reasoning and DEX aggregation.


## Prerequisites

- Python 3.10 or higher
- `uv` package manager installed
- Ollama installed locally
- Cardano testnet wallet (optional for payment receiving)


## Structure

- `agents/` - CrewAI agents for different tasks
- `tools/` - Custom tools for API interactions
- `config/` - Configuration and environment setup

## Installation

```bash
cd backend-setup
uv sync
source .venv/bin/activate
```

## 1. Install Ollama

### Linux
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### macOS
```bash
brew install ollama
```

### Windows
Download from https://ollama.com/download

### Start Ollama Server
```bash
ollama serve
```

### Pull a Model
```bash
# Recommended: llama3.2 (smaller, faster)
ollama pull llama3.2

# Alternative: llama3.1 (larger, more capable)
ollama pull llama3.1

# Or use smaller models for faster inference
ollama pull llama3.2:1b
```

## 2. Install Python Dependencies

Navigate to the backend directory and install dependencies:

```bash
cd /media/deepesh/on/work/hackthon/remit-ai/backend
source .venv/bin/activate  # If using virtual environment
uv sync
```

Dependencies installed:
- `ollama` - Ollama Python client
- `thefuzz[speedup]` - Fuzzy string matching
- `python-levenshtein` - Fast string similarity
- `crewai` - AI agent framework
- `fastapi` - Web framework
- Other core dependencies

## 3. Get Blockfrost API Key

1. Go to https://blockfrost.io
2. Sign up or log in
3. Create a new project
4. Select **Cardano Testnet**
5. Copy your API key (starts with `testnet...`)

## 4. Configure Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```bash
# Cardano Blockchain Configuration
CARDANO_BLOCKFROST_API_KEY=testnetXXXXXXXXXXXXXXXXXXXXXXXXX
CARDANO_NETWORK=testnet

# Masumi Protocol Configuration
MASUMI_API_KEY=your_masumi_api_key
MASUMI_TESTNET=true
MASUMI_PAYMENT_SERVICE_URL=http://localhost:3000

# Wallet Configuration (optional for receiving payments)
AGENT_WALLET_ADDRESS=addr_test1qz8w9...
AGENT_WALLET_SIGNING_KEY=your_signing_key

# Ollama Configuration (Local AI)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2

# API Configuration
OPENAI_API_KEY=  # Leave empty if not using OpenAI
PORT=5000
HOST=0.0.0.0
DEBUG=true
```

## 5. Cardano Testnet Wallet Setup (Optional)

If you need to receive payments:

### Using Eternl Wallet (Recommended)
1. Install Eternl wallet browser extension
2. Create a new wallet
3. Switch network to **Testnet**
4. Get free test ADA from https://docs.cardano.org/cardano-testnet/tools/faucet/
5. Copy your wallet address to `.env`

### Using cardano-cli
```bash
# Generate payment keys
cardano-cli address key-gen \
  --verification-key-file payment.vkey \
  --signing-key-file payment.skey

# Generate address
cardano-cli address build \
  --payment-verification-key-file payment.vkey \
  --out-file payment.addr \
  --testnet-magic 1  # Use 1 for preprod testnet
```

## 6. Masumi Payment Service (Optional)

If you need to deploy the Masumi Payment Service:

### Option A: Docker (Recommended)
```bash
# Pull the Masumi Payment Service Docker image
docker pull masumi/payment-service:latest

# Run the service
docker run -d \
  -p 3000:3000 \
  -e CARDANO_NETWORK=testnet \
  -e BLOCKFROST_API_KEY=your_blockfrost_key \
  --name masumi-payment-service \
  masumi/payment-service:latest
```

### Option B: Railway Deployment
1. Go to https://railway.app
2. Sign up or log in
3. Click **New Project** → **Deploy from GitHub repo**
4. Select Masumi Payment Service template
5. Configure environment variables:
   - `CARDANO_NETWORK=testnet`
   - `BLOCKFROST_API_KEY=your_blockfrost_key`
6. Deploy and copy the URL to `.env` as `MASUMI_PAYMENT_SERVICE_URL`

### Option C: Skip Payment Service
For development, you can skip deploying the payment service. The backend will work with mock data for quotes and transfers.

## 7. Start the Backend Server

```bash
# Make sure Ollama is running
ollama serve &

# Start FastAPI server
python main.py
```

The server will start on http://localhost:5000

## 8. Test the Integration

### Test User Search
```bash
# Search for users by name (fuzzy matching)
curl http://localhost:5000/api/users/search/Dipisha

# Get all users
curl http://localhost:5000/api/users

# Get user by ID
curl http://localhost:5000/api/users/1
```

### Test Ollama Integration
```bash
# Check Ollama status
curl http://localhost:5000/api/ollama/status

# Chat with agent
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Help me send money to India"}'
```

### Test Blockfrost Integration
```bash
# Get exchange rates
curl http://localhost:5000/api/rates

# Create a quote
curl -X POST http://localhost:5000/api/quote \
  -H "Content-Type: application/json" \
  -d '{"send_amount": 100, "recipient_country": "philippines"}'
```

### Test Health Check
```bash
curl http://localhost:5000/health
```

## 9. API Endpoints

### User Management
- `GET /api/users` - Get all users
- `GET /api/users/{user_id}` - Get user by ID
- `GET /api/users/search/{name}` - Fuzzy search users by name

### AI Agent
- `POST /api/chat` - Chat with Ollama agent
- `GET /api/ollama/status` - Check Ollama connection

### Remittance
- `POST /api/quote` - Create remittance quote
- `POST /api/optimize` - Optimize remittance route
- `GET /api/rates` - Get exchange rates
- `GET /api/status?transfer_id=xxx` - Get transfer status

### Health
- `GET /health` - Health check

## 10. Troubleshooting

### Ollama Connection Issues
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not running, start it
ollama serve

# Check available models
ollama list
```

### Blockfrost API Issues
```bash
# Test your API key
curl -H "project_id: YOUR_API_KEY" \
  https://cardano-testnet.blockfrost.io/api/v0/blocks/latest
```

### Import Errors
```bash
# Reinstall dependencies
uv sync --refresh
```

### Port Already in Use
```bash
# Change port in .env
PORT=5001
```

## 11. Development Tips

### Using Different Ollama Models
```bash
# List available models
ollama list

# Pull a different model
ollama pull mistral

# Update .env
OLLAMA_MODEL=mistral
```

### Adding More 
Edit `src/tools/users.py` and add entries to `MOCK_USERS`.

### Debugging
Set `DEBUG=true` in `.env` for detailed logs.

## Next Steps

1. **Test user search**: Try fuzzy matching with partial names
2. **Test Ollama chat**: Ask the agent questions about remittances
3. **Integrate with frontend**: Connect your frontend to these endpoints
4. **Deploy**: When ready, deploy to a cloud service (Railway, Heroku, etc.)

## Support

For issues or questions:
- Masumi Protocol Docs: https://docs.masumi.io
- Blockfrost Docs: https://docs.blockfrost.io
- Ollama Docs: https://github.com/ollama/ollama
