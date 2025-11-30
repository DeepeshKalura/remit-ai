# RemitAI

RemitAI is a next-generation remittance optimization platform that leverages AI agents and the Cardano blockchain to provide secure, efficient, and intelligent cross-border payment solutions.

## 🌟 Features

- **AI-Powered Optimization**: Uses CrewAI agents to find the best remittance routes and rates.
- **Blockchain Integration**: Built on Cardano using the Mesh SDK for secure and transparent transactions.
- **Masumi Protocol**: Implements MIP-003 standard for agentic payments.
- **Modern UI**: sleek, responsive interface built with Next.js and Tailwind CSS.

## 🏗 Architecture

The project consists of two main components:

- **Frontend**: A Next.js application (`/app`) that provides the user interface for sending money, managing wallets, and interacting with AI agents.
- **Backend**: A FastAPI service (`/backend`) that hosts the AI agents, handles business logic, and interacts with the Masumi Protocol.

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** (v18 or higher)
- **pnpm** (Package manager)
- **Python** (v3.10 or higher)
- **Git**

### 1. Clone the Repository

```bash
git clone <repository-url>
cd remit-ai
```

### 2. Frontend Setup

The frontend is a Next.js application located in the root directory.

1.  **Install Dependencies**:
    ```bash
    pnpm install
    ```

2.  **Configure Environment**:
    Copy the example environment file:
    ```bash
    cp .env.example .env
    ```
    Update `.env` with your configuration:
    - `NEXT_PUBLIC_BACKEND_URL`: URL of your backend service (default: `http://localhost:5000`)
    - `NEXT_PUBLIC_API_URL`: API URL (default: `http://localhost:8000`)

3.  **Run Development Server**:
    ```bash
    pnpm dev
    ```
    The app will be available at `http://localhost:3000`.

### 3. Backend Setup

The backend is a Python FastAPI application located in the `backend/` directory.

1.  **Navigate to Backend**:
    ```bash
    cd backend
    ```

2.  **Create Virtual Environment**:
    ```bash
    python -m venv .venv
    source .venv/bin/activate  # On Windows: .venv\Scripts\activate
    ```

3.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure Environment**:
    Copy the example environment file:
    ```bash
    cp .env.example .env
    ```
    Update `.env` with your API keys (see [API Keys](#-api-keys--documentation) below).

5.  **Run Backend Server**:
    ```bash
    uvicorn main:app --reload --port 8000
    ```
    The API will be available at `http://localhost:8000`.
    API Documentation (Swagger UI) is available at `http://localhost:8000/docs`.

## 🔑 API Keys & Documentation

To run the application, you will need API keys from the following services:

| Service | Description | Get API Key |
|---------|-------------|-------------|
| **Blockfrost** | Required for interacting with the Cardano blockchain. | [Get Blockfrost Key](https://blockfrost.io/) |
| **OpenAI** | Required for the AI agents (CrewAI). | [Get OpenAI Key](https://platform.openai.com/api-keys) |
| **Masumi Network** | Required for the Masumi Protocol integration. | [Masumi Documentation](https://docs.masumi.network/) |

### Backend Environment Variables Detail

- `CARDANO_BLOCKFROST_API_KEY`: Your Blockfrost project ID.
- `OPENAI_API_KEY`: Your OpenAI API key.
- `MASUMI_API_KEY`: Your Masumi Network API key.
- `ENCRYPTION_KEY`: A secure random string (min 32 chars) for encrypting wallet secrets.
- `ADMIN_KEY`: A secure string for admin authentication.
- `BLOCKFROST_API_KEY_PREPROD`: Specific key for Cardano Preprod network (if using testnet).

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS, Radix UI, Mesh SDK.
- **Backend**: FastAPI, CrewAI, LangChain, Pydantic.
- **Blockchain**: Cardano (Preprod/Mainnet).

## 🤝 Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add some amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.

## 📄 License

This project is licensed under the MIT License.
