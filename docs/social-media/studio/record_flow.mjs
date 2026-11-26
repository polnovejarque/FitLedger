/**
 * Grabador automático de flujos UI de FitLeader con Playwright (ejecutar en Ubuntu WSL 2).
 *
 * Uso:
 *   node docs/social-media/studio/record_flow.mjs --url http://localhost:5173/client-app --mode mobile --name demo-atleta
 *   node docs/social-media/studio/record_flow.mjs --url http://localhost:5173/dashboard/workouts --mode desktop --name d8-workout-editor
 *
 * Requisitos previos en Ubuntu WSL 2:
 *   npm i -D playwright && npx playwright install chromium
 */
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, idx, arr) => {
    if (cur.startsWith('--')) acc.push([cur.slice(2), arr[idx + 1] ?? 'true']);
    return acc;
  }, [])
);

const targetUrl = args.url || 'http://localhost:5173';
const mode = args.mode || 'mobile'; // 'mobile' (390x844 @2x) | 'desktop' (1280x720)
const clipName = args.name || 'capture';
const outputDir = path.resolve(process.cwd(), 'docs/social-media/studio/raw-captures');
fs.mkdirSync(outputDir, { recursive: true });

const viewport = mode === 'mobile' ? { width: 390, height: 844 } : { width: 1280, height: 720 };

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: mode === 'mobile' ? 2 : 1,
    colorScheme: 'dark',
    recordVideo: {
      dir: outputDir,
      size: viewport,
    },
  });

  const page = await context.newPage();
  console.log(`Grabando [${mode}] -> ${targetUrl}`);
  await page.goto(targetUrl, { waitUntil: 'networkidle' });

  await page.waitForTimeout(1500);
  await page.mouse.wheel(0, 350);
  await page.waitForTimeout(1200);
  await page.mouse.wheel(0, -350);
  await page.waitForTimeout(1000);

  const videoPath = await page.video()?.path();
  await context.close();
  await browser.close();

  console.log(`Captura guardada en: ${videoPath}`);
  console.log('Para convertir a MP4 H.264 y mover a Google Drive (FitLeader_Content/01_RAW_CAPTURES/):');
  console.log(`ffmpeg -i "${videoPath}" -c:v libx264 -pix_fmt yuv420p "${outputDir}/${clipName}.mp4"`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
