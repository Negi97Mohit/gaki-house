# GAKI - Complete Application Documentation

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.4.19-646CFF?logo=vite)
![Firebase](https://img.shields.io/badge/Firebase-12.6.0-FFCA28?logo=firebase)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Architecture & Data Flow](#architecture--data-flow)
- [API Integrations](#api-integrations)
- [Current Limitations](#current-limitations)
- [Development Guide](#development-guide)

---

## 🎯 Overview

**GAKI ** is a next-generation, AI-powered web application for creating professional video content with real-time effects, live captions, and multi-scene management. Built entirely in the browser using React and modern web APIs, it combines the flexibility of a video editor with the power of AI-driven content generation.

### Key Capabilities

- **Multi-Scene Studio**: Create and manage multiple scenes with independent configurations
- **AI Overlay Generation**: Generate custom HTML/CSS/JS overlays using natural language
- **Real-time Captions**: Live speech-to-text with animated, customizable styling
- **Advanced Canvas System**: Grid-based layouts with draggable, resizable elements and snapping
- **Community Sharing**: Share and load canvas presets via Firebase
- **Session Recording**: Record complete sessions with timeline-based state tracking
- **Remote Camera**: Use phone camera as video input via WebRTC
- **Picture-in-Picture**: Custom PiP implementation with resize and rotation controls

---

## ✨ Core Features

### 🎬 Scene Management

- **Multi-Scene Production**: Create unlimited scenes with independent configurations
- **Scene Transitions**: Smooth animated transitions (Dissolve, Slide, Wipe, etc.)
- **Undo/Redo**: Full history stack for scene operations
- **Per-Scene Settings**: Each scene maintains its own caption styles, effects, and layouts

### 🤖 AI-Powered Features

- **Natural Language Overlay Generation**: Create complex interactive elements using prompts (Powered by Gemini)
- **Context-Aware Updates**: AI can modify existing overlays based on new prompts
- **Voice Commands**: Speak commands to generate or update overlays
- **Smart Suggestions**: Context-aware command interface

### 🗣️ Live Captions

- **Real-time Transcription**: Powered by Deepgram Nova-2
- **Dynamic Animations**: 15+ animation styles (Karaoke, Pop-up, Typewriter, etc.)
- **Custom Styling**: Rich text formatting, fonts, colors, and visual presets
- **Preset Library**: Pre-configured caption styles for quick application

### 🎨 Canvas & Layout System

- **Interactive Grid**: Flexible grid system with draggable dividers and resizing handles
- **Smart Draggables**: Elements with predictive smoothing and inertia
- **Snap Guides**: Intelligent alignment to center, edges, and other elements
- **Layout Presets**: Huge library of pre-built compositions (Magazine, Tech, Minimal)
- **Aspect Ratio Control**: Custom aspect ratios and auto-framing for camera feeds

### 🎭 Visual Effects

- **WebGL Filters**: Real-time shaders including Neon Edge, Hologram, VHS, and Cyberpunk
- **CSS Filters**: 50+ standard filter presets (Vintage, Noir, etc.)
- **Auto-Framing**: AI-powered face tracking and centering using MediaPipe
- **Background Replacement**: Virtual backgrounds via segmentation (Blur, Image)

### 📦 Overlay Elements

- **Rich Text**: Draggable text with full formatting toolbar and design presets
- **Browser Windows**: Embed live web pages with navigation
- **File Viewers**: Display images, videos, PDFs
- **Drawing Canvas**: Integrated Excalidraw layer for sketches and annotations
- **AI-Generated**: Custom interactive HTML/CSS/JS overlays

### ⏺️ Recording & Export

- **Keyframe Recording**: Records complete state timeline (captions, layout, overlays)
- **Session Management**: Save, load, and delete recording sessions locally
- **Video Export**: Download recorded sessions as WebM
- **Playback Editor**: Review recordings with synchronized state reconstruction

### 📱 Advanced Input

- **Remote Phone Camera**: Zero-install connection via QR code (PeerJS)
- **Screen Sharing**: Capture desktop or specific windows with canvas integration
- **Virtual Camera**: Output canvas composition as a media stream for other apps

---

## 💻 Technology Stack

### Core Framework

| Technology       | Version | Purpose                 |
| ---------------- | ------- | ----------------------- |
| React            | 18.3.1  | UI framework            |
| TypeScript       | 5.8.3   | Type-safe development   |
| Vite             | 5.4.19  | Build tool & dev server |
| React Router DOM | 6.30.1  | Client-side routing     |

### Styling & UI

| Technology   | Version | Purpose               |
| ------------ | ------- | --------------------- |
| Tailwind CSS | 3.4.17  | Utility-first styling |
| shadcn/ui    | Latest  | Component library     |
| Radix UI     | Various | Accessible primitives |
| Lucide React | 0.462.0 | Icon library          |
| next-themes  | 0.3.0   | Theme management      |

### AI & Speech

| Technology    | Version | Purpose                      |
| ------------- | ------- | ---------------------------- |
| Deepgram SDK  | 4.11.2  | Speech-to-text               |
| Google Gemini | API     | AI overlay generation        |
| MediaPipe     | 0.10.22 | Face detection, segmentation |

### Media & Canvas

| Technology    | Version | Purpose                |
| ------------- | ------- | ---------------------- |
| react-rnd     | 10.5.2  | Drag & resize          |
| html-to-image | 1.11.13 | Preview generation     |
| Excalidraw    | 0.18.0  | Drawing canvas         |
| WebGL 2.0     | Native  | Advanced video effects |

### Networking & Backend

| Technology     | Version | Purpose                    |
| -------------- | ------- | -------------------------- |
| PeerJS         | 1.5.5   | WebRTC connections         |
| Firebase       | 12.6.0  | Community presets database |
| TanStack Query | 5.83.0  | Data fetching              |

### Asset APIs

| Technology  | Purpose               |
| ----------- | --------------------- |
| Pexels API  | Stock photos & videos |
| Pixabay API | Free images           |
| GIPHY API   | GIF search            |

---

## 📁 Project Structure
