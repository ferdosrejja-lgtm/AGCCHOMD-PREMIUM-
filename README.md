# Agcchomd Premium — starter project

This project includes:
- Premium dark mobile UI
- Ask Anything, Math Solver, Coding Tutor, and Learn Coding modes
- Settings screen for backend URL
- Developer profile card with a replaceable sample avatar
- Node.js backend that keeps the AI API key off the mobile app

## Important
The app is a complete starter project, but an AI service requires your own API account/key and internet access. No software can be guaranteed error-free on every device. Test before publishing. AI answers can be wrong; verify important information.

## 1. Install the tools
Install Node.js LTS on your computer. Then unzip this project.

## 2. Start the AI backend
Open a terminal inside `backend` and run:

```bash
npm install
```

Copy `.env.example` to `.env`, then edit `.env` and add your API key:
`OPENAI_API_KEY=your_real_key_here`

Start the server:

```bash
npm start
```

Check `http://localhost:3000/health` in a browser. You should see `{"ok":true,...}`.

Keep your API key private. Do not upload `.env` to GitHub or put the key in App.js.

## 3. Start the mobile app
Open a second terminal in the project root:

```bash
npm install
npx expo start
```

Install Expo Go on your Android phone and scan the QR code while the phone and computer are on the same Wi-Fi.

In the app, open Settings and enter the backend address:
- Android emulator: `http://10.0.2.2:3000`
- Physical phone: `http://YOUR_COMPUTER_LOCAL_IP:3000` (for example, `http://192.168.1.5:3000`)

Do not use `localhost` on a physical phone; that points to the phone itself. For public release, deploy the backend to a secure HTTPS host and set the HTTPS address in Settings.

## 4. Build an Android APK
For a cloud build, create an Expo account, then run in the project root:

```bash
npx eas-cli@latest login
npx eas-cli@latest build:configure
npx eas-cli@latest build --platform android --profile preview
```

If EAS asks for a build profile, add an `eas.json` file with:

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  }
}
```

The build service provides a download link when the build finishes. APK builds require internet access and an Expo account.

## 5. Customize the developer photo
The current developer avatar is a stylized letter “A” so the app works without extra image assets. To use your photo, add an image file to the project, import React Native's `Image`, and replace the `developerPhoto` gradient block in `App.js` with an `Image` using `source={require('./assets/developer.jpg')}`. Create the `assets` folder first and use your own image.

## Troubleshooting
- `Network request failed`: verify backend is running, use the computer's LAN IP on a real phone, and allow Node.js through the firewall.
- `OPENAI_API_KEY` error: make sure `backend/.env` exists and the key is valid.
- `401/429` errors: check API key, billing/usage limits, and model access.
- Android cleartext HTTP may be blocked in some release configurations. Use HTTPS for a production backend.
