import { describe, it, expect } from 'vitest';
import manifest from './manifest';
import fs from 'node:fs';
import path from 'node:path';

describe('PWA Manifest', () => {
  it('returns valid manifest metadata adhering to PWA specifications', () => {
    const data = manifest();

    expect(data.name).toBe("Warkop Ya'reh — Specialty Coffee & Coworking");
    expect(data.short_name).toBe("Warkop Ya'reh");
    expect(data.display).toBe('standalone');
    expect(data.start_url).toBe('/');
    expect(data.theme_color).toBe('#c27803');
    expect(data.background_color).toBe('#14110e');

    expect(data.icons).toBeDefined();
    expect(data.icons?.length).toBeGreaterThanOrEqual(2);

    const icon192 = data.icons?.find((icon) => icon.sizes === '192x192');
    const icon512 = data.icons?.find((icon) => icon.sizes === '512x512');
    const iconMaskable = data.icons?.find((icon) => icon.purpose === 'maskable');

    expect(icon192).toBeDefined();
    expect(icon512).toBeDefined();
    expect(iconMaskable).toBeDefined();
  });

  it('ensures referenced icon files exist on disk with valid PNG header', () => {
    const data = manifest();
    const publicDir = path.resolve(__dirname, '../../public');

    for (const icon of data.icons || []) {
      const filePath = path.join(publicDir, icon.src);
      expect(fs.existsSync(filePath), `Missing icon file at ${filePath}`).toBe(true);

      const buf = fs.readFileSync(filePath);
      const isPng =
        buf[0] === 0x89 &&
        buf[1] === 0x50 &&
        buf[2] === 0x4e &&
        buf[3] === 0x47;
      expect(isPng, `File ${icon.src} is not a valid PNG`).toBe(true);
    }
  });

  it('ensures the service worker has a static offline fallback and no debug logging', () => {
    const publicDir = path.resolve(__dirname, '../../public');
    const swPath = path.join(publicDir, 'sw.js');
    const offlineHtmlPath = path.join(publicDir, 'offline.html');

    expect(fs.existsSync(swPath)).toBe(true);
    expect(fs.existsSync(offlineHtmlPath)).toBe(true);

    const swContent = fs.readFileSync(swPath, 'utf8');
    expect(swContent).toContain('addEventListener(\'install\'');
    expect(swContent).toContain('addEventListener(\'activate\'');
    expect(swContent).toContain('addEventListener(\'fetch\'');
    expect(swContent).toContain("'/offline.html'");
    expect(swContent).toContain("statusText: 'Offline'");
    expect(swContent).not.toMatch(/console\.(log|debug|warn)\(/);
  });
});
