import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <MantineProvider
        defaultColorScheme="light"
        theme={{
          primaryColor: 'blue',
          primaryShade: 7,
          fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
          radius: {
            xs: '6px',
            sm: '8px',
            md: '12px',
            lg: '16px',
            xl: '20px',
          },
          spacing: {
            xs: '4px',
            sm: '8px',
            md: '16px',
            lg: '24px',
            xl: '32px',
          },
        }}
      >
        <App />
      </MantineProvider>
    </BrowserRouter>
  </StrictMode>,
);
