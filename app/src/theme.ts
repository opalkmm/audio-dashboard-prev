import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

export const COLORS = {
  primary: '#141330',
  secondary: '#6159E1',
  secondaryLight: '#b29eff',
  paper: '#1E1B3D',
  highlight: '#7552ff',
  highlightLighter: '#d5ccff',
  highlightDarker: '#4541a7',
  error: red.A400,
  blue: '#3a5997',
};

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    custom: true;
  }
}

// A custom theme for this app
const theme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: COLORS.primary, paper: COLORS.paper },
    primary: {
      main: COLORS.primary
    },
    secondary: {
      main: COLORS.secondary
    },
    error: {
      main: COLORS.error
    }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8
        }
      }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&:hover .MuiListItemIcon-root': {
            color: COLORS.highlightLighter
          },
          margin: '0px 10px',
          '&:hover': {
            color: COLORS.highlightLighter,
            borderRadius: '8px'
          }
        }
      }
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(20, 19, 48,0.4)'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: COLORS.paper,
          borderRadius: 15,
          boxShadow: 'none'
        }
      }
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: COLORS.highlightLighter,
          '&.Mui-checked': {
            color: COLORS.highlightLighter
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInput-underline:after': {
            borderBottomColor: '#3E68A8'
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderRadius: '8px',
              border: `3px solid ${COLORS.highlight}`
            },
            '&:hover fieldset': {
              border: `3px solid ${COLORS.highlight}`
            },
            '&.Mui-focused fieldset': {
              border: `3px solid ${COLORS.highlightLighter}`
            }
          }
        }
      }
    },
    // MuiInputBase-root-MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline
    // MuiOutlinedInput: {
    //   styleOverrides: {
    //     notchedOutline: {
    //       border: `3px solid ${COLORS.highlight}`,
    //       borderRadius: '8px'
    //     }
    //   }
    // },
    MuiButton: {
      variants: [
        {
          props: { variant: 'text' },
          style: {
            color: COLORS.highlight
          }
        },
        {
          props: { variant: 'custom' },
          style: {
            boxShadow: `0px 4px 0px 0px ${COLORS.highlight}`,
            borderRadius: '14px',
            border: `2px solid ${COLORS.highlight}`,
            backgroundColor: 'white',
            fontWeight: 700,
            color: 'black',
            ':disabled': {
              backgroundColor: `${COLORS.highlight}`,
              boxShadow: `0px 4px 0px 0px ${COLORS.paper}`,
              opacity: 0.5
            },
            '.MuiTouchRipple-root': {
              display: 'none'
            },
            ':hover': {
              backgroundColor: `${COLORS.highlightLighter}`,
              top: '-1px'
            },
            ':active': {
              top: '0px'
            }
          }
        }
      ]
    }
  },
  typography: {
    fontFamily: ['Lato', 'Open Sans', 'sans-serif'].join(','),
    h5: {
      fontWeight: 400
    },
    subtitle2: {
      fontWeight: 400
    }
  }
});

export default theme;
