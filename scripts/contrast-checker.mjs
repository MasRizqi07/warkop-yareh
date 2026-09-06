// WCAG 2.2 Contrast Ratio Calculator for Phase 0 Evidence Gate

function hexToRgb(hex) {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function sRgbToLinear(c) {
  const norm = c / 255;
  return norm <= 0.03928 ? norm / 12.92 : Math.pow((norm + 0.055) / 1.055, 2.4);
}

function getLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const lr = sRgbToLinear(r);
  const lg = sRgbToLinear(g);
  const lb = sRgbToLinear(b);
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

function getContrastRatio(hex1, hex2) {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const tokens = {
  dark: {
    primary: '#f7bb82',
    'on-primary': '#4a2800',
    surface: '#131315',
    'on-surface': '#e5e1e4',
    secondary: '#ffb95f',
    'on-secondary': '#472a00',
  },
  light: {
    primary: '#825426',
    'on-primary': '#fffdff',
    surface: '#fbf7f2',
    'on-surface': '#201f21',
    secondary: '#ee9800',
    'on-secondary': '#5b3800',
  }
};

console.log('═══════════════════════════════════════════════════════════════');
console.log('PHASE 0 WCAG 2.2 CONTRAST RATIO READOUT');
console.log('═══════════════════════════════════════════════════════════════\n');

for (const [theme, values] of Object.entries(tokens)) {
  console.log(`--- THEME: ${theme.toUpperCase()} ---`);
  
  const pairings = [
    { name: 'on-primary on primary', fg: values['on-primary'], bg: values['primary'] },
    { name: 'on-surface on surface', fg: values['on-surface'], bg: values['surface'] },
    { name: 'on-secondary on secondary', fg: values['on-secondary'], bg: values['secondary'] },
  ];

  for (const p of pairings) {
    const ratio = getContrastRatio(p.fg, p.bg);
    const passAA = ratio >= 4.5;
    const passAALarge = ratio >= 3.0;
    const passAAA = ratio >= 7.0;
    
    let status = 'PASS (AAA)';
    if (!passAAA && passAA) status = 'PASS (AA)';
    else if (!passAA && passAALarge) status = 'FLAG: < 4.5:1 (Passes AA Large/Bold 3:1 only)';
    else if (!passAALarge) status = 'FAIL (< 3:1)';

    console.log(`Pairing: ${p.name}`);
    console.log(`  Foreground: ${p.fg} | Background: ${p.bg}`);
    console.log(`  Ratio: ${ratio.toFixed(2)}:1`);
    console.log(`  Status: ${status}\n`);
  }
}

