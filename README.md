<div align="center">

# 🚀 ShareEtH

**A Decentralized Academic Knowledge Base & Storage Protocol**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Cardano](https://img.shields.io/badge/Cardano-0033AD?style=flat&logo=cardano&logoColor=white)](https://cardano.org/)
[![IPFS](https://img.shields.io/badge/IPFS-65C2CB?style=flat&logo=ipfs&logoColor=white)](https://ipfs.tech/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

[Mission Overview](#-mission-overview) •
[System Architecture](#-system-architecture) •
[Tech Stack](#%EF%B8%8F-telemetry--tech-stack) •
[Launch Sequence](#-launch-sequence-getting-started) •
[License](#-license)

</div>

---

## 🛰️ Mission Overview

**ShareEtH** is a student-focused, Web3-integrated platform engineered to decentralize academic materials. It allows users to securely upload, store, and download educational resources—such as PDFs, images, lecture slides, and documents—leveraging the immutable power of IPFS and the Cardano blockchain.

### Core Protocol Features:

- **Wallet-Based Authorization:** Connect your Lace Wallet to instantly authenticate and securely manage your access rights (Upload, Download, and Delete your own files).
- **Course-Code Telemetry:** During initial registration, users provide a username and their active `course-code`. This enables the system to intelligently filter and retrieve files relevant only to specific academic courses.
- **Proof-of-Interaction (1 ADA):** To utilize the upload protocol, our dApp requires a 1 ADA transaction. This 1 ADA is uniquely routed _back_ into your own wallet—serving as a zero-cost, verifiable on-chain proof of your file interaction.
- **Decentralized Storage:** Files are beamed to IPFS via Pinata, ensuring your study materials are never lost to centralized server failures.

---

## 🏗️ System Architecture

Below is the core structural schematic for the `shareth-backend` API and the `src` frontend interface.

```text
📦 ShareEtH
├── 📂 shareth-backend            # Mission Control (Backend API)
│   ├── 📄 .gitignore
│   ├── 📄 package-lock.json
│   ├── 📄 package.json
│   ├── 📄 server.js              # Primary Express/Node entry point
│   ├── 📂 models                 # MongoDB Schemas
│   │   ├── 📄 SavedNote.js
│   │   └── 📄 User.js
│   └── 📂 routes                 # API Endpoints
│       ├── 📄 saved.js
│       └── 📄 users.js
│
└── 📂 src                        # Flight Interface (Frontend UI)
    ├── 📄 index.css              # Global styles
    ├── 📄 main.jsx               # React DOM rendering
    ├── 📂 components             # UI Modules
    │   ├── 📄 App.jsx
    │   ├── 📄 CourseCodeModal.jsx
    │   ├── 📄 Explore.jsx
    │   ├── 📄 GridBackground.jsx
    │   ├── 📄 Header.jsx
    │   ├── 📄 LogoutModal.jsx
    │   ├── 📄 MyNotes.jsx
    │   ├── 📄 MyUploads.jsx
    │   ├── 📄 Transaction.jsx
    │   └── 📄 Upload.jsx
    └── 📂 hooks                  # Custom React Hooks logic
        ├── 📄 useAuth.js
        ├── 📄 useCardano.js
        ├── 📄 usePinata.js
        └── 📄 useWallet.js
```

---

## 🎛️ Telemetry / Tech Stack

ShareEtH operates on a modern JavaScript and Web3 stack:

- **React** — The core JavaScript library for building our responsive user interface.
- **Vite** — Next-generation frontend tooling for hyper-fast module replacement and building.
- **JavaScript & CSS** — The foundational languages powering logic and styling.
- **Pinata & IPFS** — Decentralized, peer-to-peer file storage ensuring high availability of academic documents.
- **Cardano / Lace** — The blockchain layer and browser extension wallet for handling user auth and the 1 ADA loopback transaction.
- **Blockfrost** — The API layer facilitating seamless communication with the Cardano blockchain.
- **MongoDB** — NoSQL database utilized for storing user registration data and indexing file metadata.
- **localStorage** — Temporary browser caching used to rapidly fetch uploaded note records.

---

## 🚀 Launch Sequence (Getting Started)

Follow these steps to deploy a local instance of ShareEtH on your machine.

### 1. Prerequisites

Ensure your local environment has the following installed:

- **Node.js** (v18.0.0 or higher) and **npm**
- **MongoDB** (Local instance or MongoDB Atlas URI)
- **Lace Wallet** (Browser Extension installed and set to the Cardano Preview/Preprod network)
- **API Keys:**
  - Pinata API Key & Secret
  - Blockfrost Project ID (Cardano Testnet/Preview)

### 2. Clone the Repository

```bash
git clone [https://github.com/YourUsername/ShareEtH.git](https://github.com/YourUsername/ShareEtH.git)
cd ShareEtH
```

### 3. Backend Ignition

Open a terminal and set up the backend server:

```bash
cd shareth-backend
npm install
```

Create a `.env` file inside `shareth-backend` and add your database URI:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

Start the server:

```bash
npm start
```

### 4. Frontend Ignition

Open a _second_ terminal window and set up the frontend:

```bash
# Assuming you are in the root ShareEtH folder
npm install
```

Create a `.env` file in the root directory (where `vite.config.js` lives) and add your keys:

```env
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_KEY=your_pinata_secret_key
VITE_BLOCKFROST_KEY=your_blockfrost_project_id
```

Launch the Vite development server:

```bash
npm run dev
```

### 5. Liftoff 🌍

Open your browser and navigate to `http://localhost:5173/`. Connect your Lace wallet, register your course code, and start exploring decentralized knowledge!

---

## 📜 License

This project is licensed under the MIT License - see the details below.

```text
MIT License

Copyright (c) 2024 ShareEtH

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
