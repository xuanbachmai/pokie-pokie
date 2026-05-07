/**
 * generate-symbols.mjs
 * Generates slot machine symbol images via DALL-E 3 API.
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... node scripts/generate-symbols.mjs
 *
 * Output: public/images/symbols/*.png  (1024×1024 each)
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'public', 'images', 'symbols');
fs.mkdirSync(OUT_DIR, { recursive: true });

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.error('❌  Set OPENAI_API_KEY environment variable first.');
  process.exit(1);
}

// ── Symbol prompts ────────────────────────────────────────────────────────────
// Style suffix applied to every prompt for visual consistency
const STYLE = [
  'slot machine game icon',
  'centered on pure black background',
  'vivid vibrant colors',
  '3D rendered look',
  'dramatic rim lighting',
  'no text',
  'no letters',
  'square format',
  'highly detailed',
].join(', ');

const SYMBOLS = [
  {
    name: 'dragon',
    prompt: `Vietnamese dragon, coiled body, iridescent crimson and gold scales, glowing eyes, fire breath swirling, ornate jeweled crown, ${STYLE}`,
  },
  {
    name: 'phoenix',
    prompt: `Vietnamese phoenix Phượng Hoàng, magnificent golden fire wings spread wide, orange and red feathers, radiating divine light, mythical bird, ${STYLE}`,
  },
  {
    name: 'lotus',
    prompt: `Vietnamese lotus flower Hoa Sen, fully bloomed pink petals, golden dewdrop center, jeweled emerald leaves, water ripple reflection, ${STYLE}`,
  },
  {
    name: 'lantern',
    prompt: `Traditional Vietnamese red silk lantern Đèn Lồng, glowing warm amber light from within, intricate gold tassels hanging below, ornate gold embroidery, festive, ${STYLE}`,
  },
  {
    name: 'bamboo',
    prompt: `Jade green bamboo stalks Tre Xanh, three elegant stalks with golden trim leaves, translucent green glow, zen aesthetic, lucky bamboo, ${STYLE}`,
  },
  {
    name: 'pho',
    prompt: `Vietnamese Phở noodle bowl, white ceramic bowl with blue patterns, steaming wisps of steam, green herbs, noodles visible, rustic wooden chopsticks, rich broth, ${STYLE}`,
  },
  {
    name: 'rice',
    prompt: `Vietnamese golden rice stalks Lúa, bundle of ripe rice tied with red ribbon, heavy golden grain heads drooping, harvest time, prosperity symbol, ${STYLE}`,
  },
  {
    name: 'wild',
    prompt: `Vietnamese tiger Hổ, fierce snarling face, vivid orange and black stripes, piercing golden eyes, golden WILD badge at bottom, powerful, majestic, ${STYLE}`,
  },
  {
    name: 'scatter',
    prompt: `Vietnamese Đông Sơn bronze drum, ancient circular drum with intricate sun ray patterns, mystical green-gold patina, glowing aura, FREE GAMES power, sacred artifact, ${STYLE}`,
  },
  {
    name: 'buffalo',
    prompt: `Vietnamese water buffalo Trâu, powerful muscular animal, warm honey-brown coat, curved horns with gold tips, gold nose ring, framed inside a gold coin with ridged edge, RUSH badge, ${STYLE}`,
  },
  {
    name: 'special',
    prompt: `Water buffalo silhouette inside a large prismatic diamond gem, cyan and turquoise crystal facets, rainbow light refraction, four orbiting sparkle flares, diamond sparkle effects, ${STYLE}`,
  },
];

// ── API helpers ───────────────────────────────────────────────────────────────
function post(body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request(
      {
        hostname: 'api.openai.com',
        path: '/v1/images/generations',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          try { resolve(JSON.parse(raw)); }
          catch (e) { reject(new Error('Parse error: ' + raw.slice(0, 200))); }
        });
      },
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      // Follow redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (e) => {
      fs.unlink(dest, () => {});
      reject(e);
    });
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`🎰  Generating ${SYMBOLS.length} slot symbols via DALL-E 3...\n`);

  for (const sym of SYMBOLS) {
    const dest = path.join(OUT_DIR, `${sym.name}.png`);

    if (fs.existsSync(dest)) {
      console.log(`⏭   ${sym.name}.png already exists — skipping`);
      continue;
    }

    process.stdout.write(`🖼   Generating ${sym.name}...`);
    try {
      const res = await post({
        model: 'dall-e-3',
        prompt: sym.prompt,
        n: 1,
        size: '1024x1024',
        quality: 'hd',
        response_format: 'url',
      });

      if (res.error) throw new Error(res.error.message);
      const url = res.data[0].url;

      process.stdout.write(' downloading...');
      await downloadFile(url, dest);
      console.log(` ✅  saved → ${dest}`);
    } catch (err) {
      console.error(` ❌  failed: ${err.message}`);
    }

    // Small delay to avoid rate-limiting
    await new Promise(r => setTimeout(r, 1200));
  }

  console.log('\n🎉  Done! Images saved to public/images/symbols/');
  console.log('   Next: restart the dev server to see PNG symbols in the game.');
}

main();
