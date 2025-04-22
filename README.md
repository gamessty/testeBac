# testeBac

![testeBac Logo](https://img.shields.io/badge/testeBac-Exam%20Preparation-blue?style=for-the-badge)

A modern exam preparation platform designed to help students prepare for baccalaureate and university admission exams.

![GitHub license](https://img.shields.io/github/license/gamessty/testebac)
![GitHub stars](https://img.shields.io/github/stars/gamessty/testebac)
![GitHub issues](https://img.shields.io/github/issues/gamessty/testebac)

## 📋 Overview

testeBac is a comprehensive platform dedicated to students who want to test their knowledge and prepare for important exams. The platform uses a grid test system that provides instant feedback and helps students improve their knowledge. Tests are structured by subjects and chapters to provide efficient and personalized preparation.

![App Screenshot](https://via.placeholder.com/800x400?text=testeBac+Screenshot)

## ✨ Features

- **Customized Test Generation**: Create tests tailored to specific subjects and chapters
- **Multiple Test Types**: Simple tests, mock exams, and complex configurations
- **Real-time Feedback**: Get immediate feedback on your answers
- **Progress Tracking**: Monitor your improvement over time
- **Multi-language Support**: Available in Romanian, English, French, and German
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB database

### Installation

1. Clone the repository
```bash
git clone https://github.com/testeBac/testebac.git
cd testebac
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```
Edit the `.env.local` file with your MongoDB connection string and authentication settings.

4. Set up the database
```bash
npx prisma db push
```

5. Start the development server
```bash
npm run dev
# or
yarn dev
```

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **UI Components**: [Mantine UI](https://mantine.dev/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Database**: [Prisma](https://www.prisma.io/) with MongoDB
- **Internationalization**: [next-intl](https://next-intl-docs.vercel.app/)
- **Styling**: CSS Modules

## 🌐 Internationalization

testeBac currently supports the following languages:
- 🇷🇴 Romanian
- 🇬🇧 English
- 🇫🇷 French
- 🇩🇪 German

## 🧩 Project Structure

```
testeBac/
├── app/                   # Next.js App Router components
├── components/            # Reusable UI components
├── actions/               # Server actions
├── i18n/                  # Internationalization setup
├── messages/              # Translation files
├── prisma/                # Database schema and migrations
└── public/                # Static assets
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📬 Contact

For questions or support, please open an issue or reach out to the maintainers.
Email: [Contact me](mailto:support@gamessty.eu)

---

Made with ❤️ for students preparing for their exams