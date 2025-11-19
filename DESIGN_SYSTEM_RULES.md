# Design System Integration Rules

This document outlines the structure and conventions of the Creative Suite AI application to facilitate the integration of Figma designs using the Model Context Protocol.

## 1. Design System Structure

### 1.1. Token Definitions

*   **Location:** There is no centralized design token definition file.
*   **Format/Structure:**
    *   Theme-level tokens (light/dark mode) are managed in `context/ThemeContext.tsx`. This context adds or removes the `dark` class to the `<html>` element, which enables Tailwind's `dark:` variants.
    *   Component-specific tokens can be found within the components themselves. For example, `components/Home.tsx` uses a `colorMap` object to define color classes for different workflow steps.
*   **Token Transformation:** There is no token transformation system in place.

**`context/ThemeContext.tsx`:**
```typescript
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme === 'light' || storedTheme === 'dark') {
        return storedTheme;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark'; // Default for SSR or non-browser envs
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const value = { theme, toggleTheme };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
```

**`components/Home.tsx` `colorMap` example:**
```typescript
const colorMap = {
    cyan: {
        ring: 'bg-cyan-500/20',
        iconBg: 'bg-cyan-500',
        border: 'border-cyan-500',
        button: 'bg-cyan-600 hover:bg-cyan-700',
    },
    purple: {
        ring: 'bg-purple-500/20',
        iconBg: 'bg-purple-500',
        border: 'border-purple-500',
        button: 'bg-purple-600 hover:bg-purple-700',
    },
    // ...
};
```

### 1.2. Component Library

*   **Location:** UI components are defined in the `components/` directory.
*   **Architecture:** The project uses functional React components (`React.FC`) with a props-based architecture. Components are self-contained and receive data and callbacks as props.
*   **Documentation:** There is no Storybook or other component documentation system in place.

**Example Component (`components/Home.tsx`):**
```typescript
const WorkflowStep: React.FC<{
  step: number;
  title: string;
  description: string;
  buttonText: string;
  icon: React.ReactElement;
  onNavigate: () => void;
  color: WorkflowColor;
}> = ({ step, title, description, buttonText, icon, onNavigate, color }) => {
    // ...
};
```

## 2. Frameworks & Libraries

*   **UI Framework:** React (`react`, `react-dom`)
*   **Styling:** Tailwind CSS (via CDN)
*   **Build System:** Vite
*   **Language:** TypeScript

**`package.json`:**
```json
{
  "name": "creative-suite-ai",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "@google/genai": "^1.25.0"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "@vitejs/plugin-react": "^5.0.0",
    "typescript": "~5.8.2",
    "vite": "^6.2.0"
  }
}
```

**`index.html` (Tailwind CSS CDN):**
```html
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    darkMode: 'class',
  }
</script>
```

## 3. Asset Management

*   **Storage:** There is no dedicated asset directory (e.g., `assets/` or `public/`).
*   **Referencing:** Assets, specifically images, are handled as base64 encoded strings. The `utils/fileUtils.ts` file contains a utility function to convert `File` objects to `ImageData` (which includes a base64 string and mime type).
*   **Optimization:** There are no explicit asset optimization techniques in place.

**`utils/fileUtils.ts`:**
```typescript
import { ImageData } from '../types';

export const fileToImageData = (file: File): Promise<ImageData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error('FileReader did not return a string.'));
      }
      // result is "data:mime/type;base64,..."
      const base64String = reader.result.split(',')[1];
      resolve({ base64: base64String, mimeType: file.type });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
```

## 4. Icon System

*   **Storage:** Icons are not stored as separate files.
*   **Import/Usage:** Icons are defined as inline SVG elements within React components. They are then passed as `React.ReactElement` props to child components.
*   **Naming Convention:** There is no specific naming convention for icons, as they are defined within the components that use them.

**Example Icon (`components/App.tsx`):**
```typescript
const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-3">
    <defs>
      <linearGradient id="logo-gradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#A855F7"/>
        <stop offset="100%" stopColor="#EC4899"/>
      </linearGradient>
    </defs>
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4Z" fill="url(#logo-gradient)"/>
    <path d="M12 7L13.5 10.5L17 12L13.5 13.5L12 17L10.5 13.5L7 12L10.5 10.5L12 7Z" className="dark:fill-white fill-gray-800"/>
  </svg>
);
```

## 5. Styling Approach

*   **CSS Methodology:** The project uses Tailwind CSS for styling. Classes are applied directly to the `className` attribute of React components.
*   **Global Styles:** There are no global CSS files. All styling is done through Tailwind's utility classes.
*   **Responsive Design:** Responsive design is implemented using Tailwind's responsive prefixes (e.g., `md:p-8`).

## 6. Project Structure

The codebase is organized into the following directories:

*   `components/`: Contains all React components.
*   `context/`: Contains React context providers for managing global state (e.g., theme).
*   `services/`: Contains services for interacting with external APIs (e.g., Google GenAI).
*   `utils/`: Contains utility functions.

This structure promotes a good separation of concerns between UI, state management, business logic, and utility functions.
