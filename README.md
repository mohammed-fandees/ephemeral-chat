# Ephemeral Chat

A lightweight, anonymous chat application that prioritizes simplicity and privacy.

## Features

- **Quick Anonymous Signup**: Get started immediately with a temporary email - no real email verification required
- **Single Chat Room**: One common space where all users can interact
- **No Message History**: All messages disappear when you close the app - nothing is saved on our servers
- **Privacy-Focused**: No personal data collection or persistent storage

## Getting Started

### Prerequisites

- Node.js (v22.0.0 or higher)
- npm (v11.0.0 or higher)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/mohammed-fandees/ephemeral-chat.git
   cd ephemeral-chat
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## How It Works

1. **Signup**: Enter any username and a temporary email (can be made up)
2. **Chat**: Join the main room and start chatting with other online users
3. **Privacy**: Close your browser when done - all messages are immediately discarded

## Tech Stack

- Frontend: React.js
- Backend: Node.js with Supabase
- Real-time Communication: Supabase Real-time

## Deployment

The application can be deployed on any platform that supports Node.js:

```
npm run build
npm start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This application is designed for casual, ephemeral communication. Do not share sensitive information as we cannot guarantee complete security despite our privacy-focused approach.