/**
 * TypeScript declarations for Givebutter custom elements
 */

declare namespace JSX {
  interface IntrinsicElements {
    'givebutter-widget': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      id?: string;
      /** Optional: future GiveButter attributes (e.g. data-hide-donations) – pass when documented */
      'data-hide-donations'?: string;
      'data-tickets-only'?: string;
      [key: `data-${string}`]: string | undefined;
    }, HTMLElement>;
    'givebutter-form': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      campaign?: string;
    }, HTMLElement>;
    'givebutter-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      campaign?: string;
      label?: string;
      'label-color'?: string;
      'background-color'?: string;
      'drop-shadow'?: string | boolean;
      'border-radius'?: string | number;
      'border-color'?: string;
      'border-width'?: string | number;
      'givebutter-theme'?: string;
    }, HTMLElement>;
  }
}

// Extend HTMLButtonElement to support Givebutter attributes
declare module 'react' {
  interface ButtonHTMLAttributes<T> {
    'givebutter-theme'?: string;
    'campaign'?: string;
  }
}

declare global {
  interface Window {
    Givebutter?: {
      init?: (config: {
        account: string;
        campaign?: string;
        container?: HTMLElement;
      }) => void;
    };
  }
}

export {};
