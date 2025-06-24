# SnapShot - Website Screenshot Generator

## Overview

SnapShot is a full-stack web application that allows users to capture website screenshots with customizable styling options. Users can input any URL and generate beautiful screenshots with different device types (mobile/desktop), background colors, and frame styles. The application provides a clean, modern interface for capturing and managing screenshot collections.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React hooks with TanStack Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Comprehensive shadcn/ui component system with Radix UI primitives

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful endpoints for screenshot operations
- **Development**: Hot reload with Vite integration for full-stack development

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM
- **Connection**: Neon Database serverless PostgreSQL
- **Schema**: Typed schema definitions with Drizzle-Zod validation
- **Fallback**: In-memory storage implementation for development

## Key Components

### Database Schema
- **Users Table**: User authentication with username/password
- **Screenshots Table**: Screenshot metadata including URL, device type, styling options, and file paths
- **Validation**: Zod schemas for runtime type checking and API validation

### API Endpoints
- `POST /api/screenshots/capture` - Capture new screenshots with customization options
- `GET /api/screenshots` - Retrieve recent screenshots with optional limit
- `GET /api/screenshots/:id` - Get specific screenshot details
- `DELETE /api/screenshots/:id` - Remove screenshots

### Frontend Components
- **ScreenshotCapture**: URL input and capture initiation
- **BackgroundOptions**: Color and gradient selection for screenshot backgrounds
- **FrameOptions**: Frame style and color customization
- **PreviewArea**: Live preview of captured screenshots with download functionality
- **RecentScreenshots**: Gallery view of previously captured screenshots

### External Service Integration
- **ScreenshotOne API**: Third-party service for website screenshot generation
- **Configuration**: API key-based authentication with environment variable management

## Data Flow

1. **User Input**: User enters URL and selects styling preferences (device type, background, frame)
2. **Validation**: Frontend validates URL format and settings using Zod schemas
3. **API Request**: Form data sent to backend capture endpoint
4. **Screenshot Generation**: Backend calls ScreenshotOne API with specified parameters
5. **Data Storage**: Screenshot metadata stored in PostgreSQL database
6. **Response**: Frontend receives screenshot data and updates UI
7. **Display**: Screenshot shown in preview area with download options
8. **History**: Recent screenshots cached and displayed in gallery view

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Query for modern React patterns
- **Build Tools**: Vite, TypeScript, ESBuild for development and production builds
- **Database**: Drizzle ORM, Neon Database driver, PostgreSQL connection handling

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework with custom theme configuration
- **shadcn/ui**: Complete component library built on Radix UI primitives
- **Radix UI**: Accessible, unstyled UI primitives for complex components

### Development Tools
- **TypeScript**: Full type safety across frontend and backend
- **Replit Integration**: Custom development environment with live preview
- **Hot Reload**: Vite-powered development server with instant updates

### External APIs
- **ScreenshotOne**: Professional screenshot generation service
- **Environment Configuration**: API key management through environment variables

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20 runtime
- **Database**: PostgreSQL 16 module integration
- **Development Server**: Concurrent frontend/backend development with port 5000
- **Hot Reload**: File watching with automatic browser refresh

### Production Build
- **Frontend**: Vite production build with optimized assets
- **Backend**: ESBuild bundling for Node.js deployment
- **Database**: Drizzle migration system for schema management
- **Environment**: Production environment variable configuration

### Scaling Strategy
- **Deployment Target**: Autoscale configuration for traffic handling
- **Static Assets**: Optimized frontend bundle serving
- **Database**: Serverless PostgreSQL for automatic scaling
- **API Rate Limiting**: Ready for implementation with screenshot service limits

## Changelog

```
Changelog:
- June 24, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```