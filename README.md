# User Registration System

A Next.js application for user registration with OTP verification and admin messaging functionality.

## Features

- User registration with OTP verification
- Admin dashboard for user management
- Mass messaging system
- Persistent user storage using JSON files
- Email notifications

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Nodemailer for email functionality

## Prerequisites

- Node.js 18.x or later
- npm or yarn
- Gmail account for email functionality

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_gmail_app_password
NEXT_PUBLIC_ADMIN_PASSWORD=your_admin_password
```

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

### Using Vercel (Recommended)

1. Create a Vercel account at [vercel.com](https://vercel.com)
2. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```
3. Login to Vercel:
   ```bash
   vercel login
   ```
4. Deploy:
   ```bash
   vercel
   ```

### Environment Variables in Vercel

After deployment, set up the following environment variables in your Vercel project settings:

- `EMAIL_USER`: Your Gmail address
- `EMAIL_PASS`: Your Gmail App Password
- `NEXT_PUBLIC_ADMIN_PASSWORD`: Your admin dashboard password

## Project Structure

```
src/
  ├── app/
  │   ├── api/
  │   │   ├── register/
  │   │   ├── users/
  │   │   └── message/
  │   ├── admin/
  │   └── page.tsx
  ├── utils/
  │   └── userStorage.ts
  └── styles/
      └── globals.css
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
