const Theme = (colors) => {
  const { red, gold, cyan, green, grey } = colors;

  const greyColors = {
    0: grey[0],
    50: grey[1],
    100: grey[2],
    200: grey[3],
    300: grey[4],
    400: grey[5],
    500: grey[6],
    600: grey[7],
    700: grey[8],
    800: grey[9],
    900: grey[10],
    A50: grey[15],
    A100: grey[11],
    A200: grey[12],
    A400: grey[13],
    A700: grey[14],
    A800: grey[16]
  };

  const contrastText = '#fff';

  // const customPrimary = [
  //   '#f2e9e9', // lighter
  //   '#d9c2c2', // 100
  //   '#c19999', // 200
  //   '#a97373', // light
  //   '#8f4e4e', // 400
  //   '#492121', // main
  //   '#3f1c1c', // dark
  //   '#351717', // 700
  //   '#2b1212', // darker
  //   '#1f0d0d' // 900
  // ];

  // create new custom primary with #ffce03 color

  const customPrimary = [
    '#fff8e1', // lighter
    '#ffecb3', // 100
    '#ffe082', // 200
    '#ffd54f', // light
    '#ffca28', // 400
    '#ffce03', // main
    '#e6b800', // dark
    '#cc9900', // 700
    '#b38600', // darker
    '#996f00' // 900
  ];

  return {
    primary: {
      lighter: customPrimary[0],
      100: customPrimary[1],
      200: customPrimary[2],
      light: customPrimary[3],
      400: customPrimary[4],
      main: customPrimary[5],
      dark: customPrimary[6],
      700: customPrimary[7],
      darker: customPrimary[8],
      900: customPrimary[9],
      contrastText
    },

    secondary: {
      lighter: greyColors[100],
      100: greyColors[100],
      200: greyColors[200],
      light: greyColors[300],
      400: greyColors[400],
      main: greyColors[500],
      600: greyColors[600],
      dark: greyColors[700],
      800: greyColors[800],
      darker: greyColors[900],
      A100: greyColors[0],
      A200: greyColors.A400,
      A300: greyColors.A700,
      contrastText: greyColors[0]
    },
    error: {
      lighter: red[0],
      light: red[2],
      main: red[4],
      dark: red[7],
      darker: red[9],
      contrastText
    },
    warning: {
      lighter: gold[0],
      light: gold[3],
      main: gold[5],
      dark: gold[7],
      darker: gold[9],
      contrastText: greyColors[100]
    },
    info: {
      lighter: cyan[0],
      light: cyan[3],
      main: cyan[5],
      dark: cyan[7],
      darker: cyan[9],
      contrastText
    },
    success: {
      lighter: green[0],
      light: green[3],
      main: green[5],
      dark: green[7],
      darker: green[9],
      contrastText
    },
    grey: greyColors
  };
};

export default Theme;
