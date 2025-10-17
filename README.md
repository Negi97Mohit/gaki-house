# gaki がき

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-latest-purple)

A powerful, web-based video recording studio that leverages AI to create dynamic overlays, real-time captions, and professional-grade video effects directly in your browser.



## ✨ Features

* **🤖 AI-Powered Overlays:** Generate complex HTML/CSS/JS visual overlays from natural language prompts using Groq's Llama 3.3 model. The AI can even use real-world assets like Font Awesome icons and brand logos.
* **🌐 In-App Browser:** Press the **`/`** key to open a draggable, resizable, and rotatable browser window inside your video canvas, perfect for showcasing websites.
* **✍️ Dynamic Live Captions:** Go beyond static text with word-by-word animated caption styles like Karaoke and Pop Up. A deep customization panel in the sidebar allows for full control over fonts, colors, shapes, and animations.
* **🎨 Real-Time Video Effects:**
    * **Backgrounds:** Instantly blur your background or replace it with a custom image.
    * **Filters:** Apply over 50 different color filters, from vintage to cyberpunk.
    * **Auto-Framing:** Automatically keeps your face centered in the frame.
    * **Neon Edge:** A custom pixel-level effect that adds a glowing outline to your video feed.
* **🧩 Flexible Layouts:** Arrange your content with professional layouts:
    * **Picture-in-Picture (PiP):** A draggable and resizable video overlay.
    * **Split Screen:** A vertically or horizontally split view with an adjustable divider.
    * **Custom Shapes:** Mask your camera into a circle, rounded rectangle, or a custom-uploaded SVG/PNG shape.
* **🎤 Multi-Engine Speech-to-Text:** The app is architected to support multiple STT engines:
    * **Deepgram:** High-accuracy, cloud-based transcription.
    * **Browser-native:** Utilizes the browser's built-in SpeechRecognition API.
    * **Vosk:** Can be configured for offline transcription.
* **🔴 Recording & Download:** Capture your camera, microphone, and screen share into a single high-quality `.webm` video file that you can download instantly.

## 💻 Tech Stack

* **Framework:** React 18 with TypeScript
* **Bundler:** Vite
* **Styling:** Tailwind CSS with Shadcn/UI for components
* **AI:** Groq API (Llama 3.3) for generative UI
* **Interactivity:** `react-rnd` for draggable components
* **Icons:** Lucide React

## 🚀 Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

* Node.js (v18 or later)
* npm or yarn

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <your-project-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    You'll need to provide API keys for the AI and speech recognition services. Create a new file named `.env` in the root of your project by copying the example file:
    ```bash
    cp .env.example .env
    ```
    Now, open the `.env` file and add your secret keys:
    ```
    VITE_GROQ_API_KEY="your-groq-api-key"
    VITE_DEEPGRAM_API_KEY="your-deepgram-api-key"
    ```

### Running the Development Server

This project is configured to run with the Netlify CLI to simulate the production environment, including serverless functions.

1.  **Install the Netlify CLI:**
    ```bash
    npm install -g netlify-cli
    ```

2.  **Run the local dev server:**
    ```bash
    netlify dev
    ```

3.  Open your browser and navigate to `http://localhost:8888` (or the URL provided in your terminal).

## 🌐 Deployment

This project is pre-configured for seamless deployment to **Netlify**. The `netlify.toml` file contains all the necessary build commands, publish directories, and redirect rules for a Single-Page Application.

To deploy, simply link your Git repository to a new Netlify site and configure the same environment variables in the Netlify dashboard under **Site settings > Build & deploy > Environment**.