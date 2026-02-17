import type { Preview } from '@storybook/react';

import '../globals.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'Nexara Dark',
      values: [
        { name: 'Nexara Dark', value: '#080B12' },
        { name: 'Nexara Surface', value: '#162032' },
        { name: 'Light', value: '#F8FAFC' },
        { name: 'White', value: '#FFFFFF' },
      ],
    },
    layout: 'padded',
  },
  globalTypes: {
    theme: {
      description: 'Theme mode',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'dark', title: 'Dark', icon: 'moon' },
          { value: 'light', title: 'Light', icon: 'sun' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || 'dark';
      document.documentElement.classList.toggle('dark', theme === 'dark');
      document.documentElement.setAttribute('data-theme', theme);
      return Story();
    },
  ],
};

export default preview;
