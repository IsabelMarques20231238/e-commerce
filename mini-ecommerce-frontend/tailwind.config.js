/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        "secondary": "#5e5e5e", "on-secondary": "#ffffff", "secondary-container": "#e4e2e2",
        "surface-container-low": "#f3f3f4", "tertiary-fixed": "#e2e2e2", "error-container": "#ffdad6",
        "on-primary": "#ffffff", "on-background": "#1a1c1c", "surface-bright": "#f9f9f9",
        "on-secondary-fixed": "#1b1c1c", "on-error": "#ffffff", "primary-fixed-dim": "#ffb4a4",
        "inverse-surface": "#2f3131", "surface-tint": "#b62506", "tertiary-fixed-dim": "#c6c6c7",
        "inverse-primary": "#ffb4a4", "on-primary-container": "#fffbff", "secondary-fixed": "#e4e2e2",
        "on-tertiary": "#ffffff", "on-surface-variant": "#5b403b", "surface-dim": "#dadada",
        "on-primary-fixed": "#3e0500", "surface-container": "#eeeeee", "on-error-container": "#93000a",
        "primary-container": "#d63c1e", "inverse-on-surface": "#f0f1f1", "primary": "#b22204",
        "on-surface": "#1a1c1c", "surface-variant": "#e2e2e2", "surface": "#f9f9f9",
        "surface-container-highest": "#e2e2e2", "outline-variant": "#e3beb6",
        "surface-container-lowest": "#ffffff", "surface-container-high": "#e8e8e8",
        "on-tertiary-container": "#fcfcfc", "tertiary-container": "#737575", "on-tertiary-fixed": "#1a1c1c",
        "background": "#f9f9f9", "error": "#ba1a1a", "tertiary": "#5b5c5c",
        "secondary-fixed-dim": "#c8c6c6", "on-secondary-fixed-variant": "#464747",
        "on-primary-fixed-variant": "#8d1600", "outline": "#8f7069", "on-tertiary-fixed-variant": "#454747",
        "primary-fixed": "#ffdad3", "on-secondary-container": "#646464"
      },
      spacing: {
        "xl": "32px",
        "lg": "24px",
        "md": "16px",
        "sm": "8px",
        "xs": "4px",
        "margin-mobile": "16px",
        "margin-desktop": "auto",
        "max-width": "1200px",
        "gutter": "16px",
        "base": "8px"
      },
      fontFamily: {
        "body-md": ["Inter", "sans-serif"],
        "price-display": ["Inter", "sans-serif"],
        "label-lg": ["Inter", "sans-serif"],
        "headline-lg": ["Inter", "sans-serif"],
        "headline-md": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "label-md": ["Inter", "sans-serif"]
      },
      fontSize: {
        "body-md": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
        "price-display": ["22px", {"lineHeight": "28px", "fontWeight": "700"}],
        "label-lg": ["14px", {"lineHeight": "16px", "fontWeight": "600"}],
        "headline-lg": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
        "headline-md": ["20px", {"lineHeight": "28px", "fontWeight": "600"}],
        "body-lg": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
        "label-md": ["12px", {"lineHeight": "16px", "fontWeight": "500"}]
      }
    },
    borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" }
  },
  plugins: [require('@tailwindcss/forms')],
}
