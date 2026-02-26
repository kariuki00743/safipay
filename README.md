# SafiPay - Secure M-Pesa Escrow Platform

<div align="center">

![SafiPay Logo](https://img.shields.io/badge/SafiPay-Escrow-00c566?style=for-the-badge)
[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://kariuki00743.github.io/safipay/)
[![Backend](https://img.shields.io/badge/Backend-Render-purple?style=for-the-badge)](https://safipay.onrender.com)

**Secure online transactions in Kenya with M-Pesa escrow protection**

[Live Demo](https://kariuki00743.github.io/safipay/) • [Report Bug](https://github.com/kariuki00743/safipay/issues) • [Request Feature](https://github.com/kariuki00743/safipay/issues)

</div>

---

## 🎯 What is SafiPay?

SafiPay is a modern escrow payment platform built specifically for the Kenyan market. It protects both buyers and sellers in online transactions by holding funds securely until both parties are satisfied. Think of it as a trusted middleman that ensures fair deals for everyone.

### The Problem We Solve

- **Buyers worry**: "What if I pay and never receive the item?"
- **Sellers worry**: "What if I ship the item and never get paid?"
- **SafiPay's solution**: Funds are held in escrow until the transaction is complete

### How It Works

1. **Create Transaction** - Buyer and seller agree on terms
2. **Buyer Pays** - Funds sent via M-Pesa are held securely
3. **Item Delivered** - Seller ships/delivers as agreed
4. **Release Payment** - Buyer confirms receipt, seller gets paid instantly

---

## ✨ Key Features

### 🔒 Security First
- **JWT Authentication** - All API endpoints secured with token verification
- **User Ownership Validation** - Users can only access their own transactions
- **M-Pesa Integration** - Direct STK Push for secure payments
- **Transaction State Management** - Proper flow validation at every step

### 💳 Payment Processing
- **M-Pesa STK Push** - Instant payment prompts to buyer's phone
- **Real-time Status Updates** - Automatic polling for payment confirmation
- **Manual Confirmation** - Backup option if automatic confirmation fails
- **Payment Cancellation** - Cancel and retry if needed

### 🛡️ Dispute Resolution
- **Evidence Upload** - Submit up to 5 photos as proof
- **Detailed Descriptions** - Explain what went wrong
- **Item Comparison** - Describe expected vs actual delivery
- **48-Hour Review** - Team reviews and resolves disputes quickly

### 📧 Email Notifications
- Transaction created
- Payment received (with M-Pesa receipt)
- Funds released
- Dispute raised
- Refund processed
- Beautiful HTML templates ready for production

### 📊 Transaction Management
- **Timeline View** - Visual history of all transaction events
- **Search & Filter** - Find transactions by description, email, or receipt
- **Status Tracking** - Real-time updates on transaction progress
- **Refund System** - Process refunds for disputed transactions

### 📱 Mobile Responsive
- Works perfectly on phones, tablets, and desktops
- Touch-friendly interface
- Optimized for Kenyan users

---

## 🚀 Tech Stack

### Frontend
- **React** - Modern UI library
- **Vite** - Lightning-fast build tool
- **Supabase Auth** - User authentication
- **React Router** - Client-side routing

### Backend
- **Node.js + Express** - RESTful API server
- **Supabase** - PostgreSQL database with real-time features
- **M-Pesa Daraja API** - Payment processing
- **JWT** - Secure authentication tokens

### Deployment
- **Frontend**: GitHub Pages
- **Backend**: Render.com
- **Database**: Supabase Cloud

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 16+ and npm
- Supabase account
- M-Pesa Daraja API credentials (sandbox or production)

### 1. Clone the Repository
```bash
git clone https://github.com/kariuki00743/safipay.git
cd safipay
```

### 2. Install Dependencies
```bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend
npm install
cd ..
```

### 3. Configure Environment Variables

**Frontend (`.env`):**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BACKEND_URL=http://localhost:3001
```

**Backend (`backend/.env`):**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key

MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=http://localhost:3001/api/callback

PORT=3001
```

### 4. Set Up Database

Run the migrations in your Supabase SQL Editor:

```bash
# Phase 1: Security improvements
backend/migrations/001_phase1_security.sql

# Phase 2: Features (timeline, refunds)
backend/migrations/002_phase3_features.sql

# Phase 3: Enhanced disputes
backend/migrations/003_enhanced_disputes.sql
```

### 5. Run Development Servers

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```

Visit `http://localhost:5173` to see the app!

---

## 🌐 Deployment

### Frontend (GitHub Pages)
```bash
npm run deploy
```

### Backend (Render.com)
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Add all environment variables from `backend/.env`
5. Deploy!

---

## 📋 API Endpoints

### Authentication Required
All endpoints require `Authorization: Bearer <jwt_token>` header

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/stkpush` | Initiate M-Pesa STK Push |
| POST | `/api/release` | Release funds to seller |
| POST | `/api/dispute` | Raise dispute with evidence |
| POST | `/api/refund` | Process refund to buyer |
| POST | `/api/confirm-payment` | Manually confirm payment |
| POST | `/api/cancel-payment` | Cancel pending payment |

### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API status |
| GET | `/health` | Health check |
| POST | `/api/callback` | M-Pesa callback (webhook) |

---

## 🎨 Use Cases

SafiPay is perfect for:

- 📱 **Electronics** - Phones, laptops, gadgets
- 🏠 **Real Estate** - Property deposits, rent payments
- 🚗 **Vehicles** - Cars, motorcycles, spare parts
- 💻 **Freelance Work** - Web development, design, writing
- 👕 **Fashion** - Clothes, shoes, accessories
- 🪑 **Furniture** - Home and office furniture
- 🎮 **Gaming** - Consoles, games, accounts
- 📚 **Education** - Online courses, tutoring
- 🎨 **Art & Collectibles** - Artwork, antiques, rare items

---

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ User ownership validation
- ✅ Transaction state validation
- ✅ Phone number format validation
- ✅ SQL injection protection (Supabase RLS)
- ✅ CORS configuration
- ✅ Environment variable validation
- ✅ Secure M-Pesa integration

---

## 📱 Screenshots

### Landing Page
Modern, professional landing page tailored for the Kenyan market with trust indicators and clear value proposition.

### Dashboard
Clean interface showing all transactions with search, filters, and real-time status updates.

### Transaction Details
Comprehensive view with timeline, evidence photos, and action buttons based on transaction status.

### Dispute Modal
Amazon-style dispute resolution with photo upload and detailed description fields.

---

## 🛣️ Roadmap

### Completed ✅
- [x] Core escrow functionality
- [x] M-Pesa STK Push integration
- [x] User authentication
- [x] Transaction timeline
- [x] Dispute resolution with evidence
- [x] Email notifications
- [x] Refund system
- [x] Mobile responsive design
- [x] Real-time payment polling
- [x] Search and filtering

### Coming Soon 🚧
- [ ] Admin dashboard for dispute resolution
- [ ] SMS notifications
- [ ] Multi-currency support
- [ ] Escrow for services (milestone-based)
- [ ] Rating system for buyers/sellers
- [ ] Transaction analytics
- [ ] Automated dispute resolution
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Kariuki**
- GitHub: [@kariuki00743](https://github.com/kariuki00743)

---

## 🙏 Acknowledgments

- Safaricom for the M-Pesa Daraja API
- Supabase for the amazing backend platform
- The Kenyan tech community for inspiration

---

## 📞 Support

For support, email support@safipay.com or open an issue on GitHub.

---

<div align="center">

**Made with 💚 in Kenya, for Kenyans**

[⬆ Back to Top](#safipay---secure-m-pesa-escrow-platform)

</div>
