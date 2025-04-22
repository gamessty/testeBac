"use client";

import { createTheme, CSSVariablesResolver } from "@mantine/core";

export const theme = createTheme({
  other: {
    appShellFooterHeight: '60px',
    darkModeImageFilter: 'invert(1) hue-rotate(180deg)',
    darkModeImageFilter2: 'invert(0.823)'
    
  },
  /* Put your mantine theme override here */
  breakpoints: {
    xs: '30em',
    sm: '48em',
    md: '62em',
    lg: '75em',
    xl: '88em',
    xxl: '100em',
    xxxl: '120em',
  },
});

export const resolver: CSSVariablesResolver = (theme) => ({
  variables: {
    '--app-shell-footer-height': theme.other.appShellFooterHeight,
  },
  dark: {
    '--image-filter': theme.other.darkModeImageFilter,
    '--image-filter-2': theme.other.darkModeImageFilter2
  }, light: {},
});
