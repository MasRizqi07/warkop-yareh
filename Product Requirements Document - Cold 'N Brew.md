## **PRODUCT REQUIREMENTS DOCUMENT (PRD)** 

## **Digitalisasi Coffee Shop Cold 'N Brew - Gubeng** 

## **Version** 

v1.0 

## **Status** 

Product Discovery & Planning 

## **Prepared By** 

Product Manager 

## **Date** 

June 2026 

## **1. EXECUTIVE SUMMARY** 

Cold 'N Brew Gubeng merupakan coffee shop modern yang beroperasi 24 jam dan melayani pelanggan dine-in, take-away, drive-thru, delivery, komunitas, meeting, serta work-from-cafe. 

Saat ini sebagian besar proses operasional masih terfragmentasi antara kasir, WhatsApp, Google Maps, marketplace, dan pencatatan manual. 

Tujuan digitalisasi adalah membangun ekosistem digital terintegrasi yang mampu meningkatkan: 

- Revenue 

- Customer Retention 

- Operational Efficiency 

- Data-Driven Decision Making 

- Brand Loyalty 

## **2. PRODUCT VISION** 

Menjadi coffee shop digital-first terbaik di Surabaya yang menghadirkan pengalaman pemesanan, pembayaran, loyalitas pelanggan, dan operasional bisnis secara terintegrasi dalam satu platform. 

1 

## **3. BUSINESS OBJECTIVES** 

## **Primary Goals** 

## **BO-01** 

Meningkatkan revenue sebesar 30% dalam 12 bulan. 

## **BO-02** 

Meningkatkan repeat customer sebesar 40%. 

## **BO-03** 

Mengurangi waktu pemesanan hingga 50%. 

## **BO-04** 

Mengurangi kesalahan pesanan hingga 80%. 

## **BO-05** 

Meningkatkan customer satisfaction score menjadi >90%. 

## **4. PRODUCT GOALS** 

Platform harus memungkinkan: 

- Pemesanan digital 

- Loyalty Program 

- Membership 

- Customer Analytics 

- Inventory Management 

- POS Integration 

- Marketing Automation 

- Event Management 

- Multi Channel Ordering 

## **5. TARGET USERS** 

## **Persona 1 - Student** 

Usia: 18-25 tahun 

2 

Kebutuhan: 

- Nongkrong • Nugas • Wifi • Promo 

Pain Points: 

- Antri lama • Tidak tahu promo 

## **Persona 2 - Freelancer** 

Usia: 22-35 tahun 

Kebutuhan: 

- Tempat kerja • Meeting • Reservasi 

Pain Points: 

- Sulit booking tempat 

## **Persona 3 - Corporate Worker** 

Usia: 24-40 tahun 

Kebutuhan: 

- Meeting • Delivery 

- Quick Order 

Pain Points: 

- Waktu terbatas 

## **Persona 4 - Community Leader** 

Usia: 20-40 tahun 

3 

Kebutuhan: 

- Event 

- Gathering 

- Reservasi area 

Pain Points: 

- Sulit koordinasi booking 

## **6. PRODUCT SCOPE** 

## **In Scope** 

## **Customer Mobile Experience** 

- Website 

- Progressive Web App 

- QR Menu • Online Ordering • Loyalty 

- Membership 

- Reservation 

## **Staff Operations** 

- POS • Kitchen Display System • Inventory • Employee Management 

## **Admin Management** 

- Dashboard • Reports • Analytics • Marketing 

## **Out Of Scope (Phase 1)** 

- Franchise Management 

- Multi Outlet Management 

- ERP 

- Accounting System 

4 

## **7. CORE FEATURES** 

## **MODULE 1** 

CUSTOMER APPLICATION 

## **Feature 1.1** 

Authentication 

Functions: 

- Register 

- Login 

- Google Login 

- OTP Login 

## **Feature 1.2** 

Profile Management 

Functions: 

- Edit profile 

- Favorite menu 

- Order history • Membership status 

## **Feature 1.3** 

Digital Menu 

Functions: 

- Browse menu 

- Search menu 

- Categories 

- Recommendation 

- Bestseller 

## **Feature 1.4** 

QR Ordering 

5 

Customer scans QR code. 

Flow: 

Scan QR → Select Table → Order → Pay → Kitchen → Served 

## **Feature 1.5** 

Online Ordering 

Options: 

- Dine In 

- Take Away 

- Drive Thru 

- Delivery 

## **Feature 1.6** 

Reservation 

Functions: 

- Book table 

- Book meeting room 

- Event reservation 

## **Feature 1.7** 

Loyalty Program 

Features: 

- Earn Points 

- Redeem Points 

- Rewards 

- Birthday Rewards 

## **Feature 1.8** 

Membership 

Tier: 

Bronze Silver Gold Platinum 

6 

Benefits: 

- Discount 

- Free Drink 

- Priority Reservation 

- Event Access 

## **MODULE 2** 

POINT OF SALE (POS) 

Functions: 

- New Order • Split Bill 

- Discount 

- Voucher • Payment • Refund 

Payment: 

- Cash 

- QRIS • Debit 

- Credit Card 

- E-Wallet 

## **MODULE 3** 

KITCHEN DISPLAY SYSTEM 

Functions: 

- Incoming Orders 

- Order Queue 

- Cooking Status 

- Ready Status 

Statuses: 

Pending Preparing Ready Completed 

7 

## **MODULE 4** 

INVENTORY MANAGEMENT 

Functions: 

- Stock Tracking 

- Ingredient Tracking 

- Supplier Management 

- Purchase Orders 

Alerts: 

- Low Stock 

- Out Of Stock 

- Expired Ingredients 

## **MODULE 5** 

CRM 

Functions: 

- Customer Database 

- Segmentation 

- Purchase History 

- Loyalty Tracking 

Segments: 

New Customer Active Customer VIP Customer Inactive Customer 

## **MODULE 6** 

MARKETING AUTOMATION 

Channels: 

- WhatsApp 

- Email 

- Push Notification 

Campaigns: 

- Birthday Promo 

- Weekend Promo 

8 

- New Menu 

- Event Promotion 

## **MODULE 7** 

EVENT MANAGEMENT 

Functions: 

- Event Creation 

- Event Registration 

- Ticketing 

- Attendance Tracking 

Examples: 

- Nobar 

- Workshop 

- Community Meetup 

- Open Mic 

## **MODULE 8** 

ADMIN DASHBOARD 

Metrics: 

- Revenue 

- Orders 

- Best Seller Menu 

- Active Customers 

- Inventory Health 

Reports: 

- Daily 

- Weekly 

- Monthly 

- Annual 

9 

## **8. USER JOURNEYS** 

## **Customer Ordering Journey** 

Open Website → Login → Browse Menu → Add To Cart → Checkout → Payment → Order Tracking → Complete 

## **Reservation Journey** 

Choose Date → Choose Table → Confirm → Pay Deposit → Reservation Confirmed 

## **Loyalty Journey** 

Purchase → Earn Points → Reach Threshold → Redeem Rewards 

## **9. NON-FUNCTIONAL REQUIREMENTS** 

## **Performance** 

Page Load: < 2 Seconds 

API Response: < 500ms 

Concurrent Users: 10,000+ 

Availability: 99.9% 

## **Security** 

JWT Authentication 

Role Based Access Control 

Rate Limiting 

Encryption 

HTTPS 

OWASP Top 10 Compliance 

10 

## **Scalability** 

Microservice Ready 

Cloud Native 

Containerized 

Horizontal Scaling 

## **10. TECHNICAL REQUIREMENTS** 

## **Frontend** 

Next.js 15 

React 19 

TypeScript 

Tailwind CSS 

Shadcn UI 

Framer Motion 

PWA 

## **Backend** 

NestJS 

TypeScript 

REST API 

WebSocket 

## **Database** 

PostgreSQL 

Redis 

11 

Prisma ORM 

## **Infrastructure** 

Docker 

Nginx 

Cloudflare 

Vercel 

AWS 

## **11. SUCCESS METRICS** 

KPIs 

Monthly Revenue 

Average Order Value 

Customer Retention Rate 

Repeat Purchase Rate 

Membership Conversion 

Reservation Conversion 

Campaign ROI 

Inventory Accuracy 

NPS Score 

Customer Satisfaction Score 

## **12. PHASE ROADMAP** 

PHASE 1 

12 

Foundation 

- Website 

- Menu 

- Ordering 

- POS 

Timeline: 8 Weeks 

PHASE 2 

Growth 

- Loyalty • Membership • CRM • Reservation 

Timeline: 6 Weeks 

PHASE 3 

Automation 

- Marketing Automation 

- Analytics 

- Event Management 

Timeline: 6 Weeks 

PHASE 4 

Scale 

- Multi Branch 

- Franchise 

- AI Recommendation 

- Predictive Analytics 

Timeline: 8 Weeks 

## **FINAL PRODUCT STATEMENT** 

Cold 'N Brew Digital Platform adalah sistem terpadu yang menghubungkan pelanggan, kasir, barista, dapur, manajemen, dan marketing dalam satu ekosistem digital modern untuk meningkatkan efisiensi operasional, loyalitas pelanggan, dan pertumbuhan bisnis secara berkelanjutan. 

13 

