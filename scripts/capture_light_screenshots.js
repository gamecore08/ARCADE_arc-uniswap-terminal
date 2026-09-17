import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const TARGET_DIR = path.resolve(__dirname, '../docs/images');

async function capture() {
  console.log('Launching browser for Light Mode screenshots...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    defaultViewport: {
      width: 1280,
      height: 820,
      deviceScaleFactor: 2, // High-DPI crisp capture
    },
  });

  const page = await browser.newPage();

  // Set theme to light mode in localStorage before loading
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('arcade_theme', 'light');
    localStorage.setItem('arcade_lang', 'en');
  });

  console.log('Navigating to http://localhost:5175/ ...');
  await page.goto('http://localhost:5175/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // Ensure document does NOT have 'dark' class
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('arcade_theme', 'light');
  });
  await new Promise(r => setTimeout(r, 500));

  // 1. Pools Explore View
  console.log('Capturing 1. Pools Explore View...');
  await page.screenshot({
    path: path.join(TARGET_DIR, 'pools_explore.png'),
    fullPage: false,
  });

  // 2. Swap Interface
  console.log('Capturing 2. Token Swap Interface...');
  await page.evaluate(() => {
    const tradeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Trade') || b.textContent.includes('Swap'));
    if (tradeBtn) tradeBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({
    path: path.join(TARGET_DIR, 'swap_interface.png'),
    fullPage: false,
  });

  // 3. Add Liquidity Modal
  console.log('Capturing 3. Add Concentrated Liquidity Modal...');
  // Go back to pools first
  await page.evaluate(() => {
    const poolNav = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Pool'));
    if (poolNav) poolNav.click();
  });
  await new Promise(r => setTimeout(r, 600));
  
  // Click first Add Liquidity button in table
  await page.evaluate(() => {
    const addBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('Add'));
    if (addBtns.length > 0) addBtns[0].click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({
    path: path.join(TARGET_DIR, 'add_liquidity.png'),
    fullPage: false,
  });

  // Close Add Liquidity modal by pressing Escape
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 400));

  // 4. My Positions Dashboard
  console.log('Capturing 4. My Positions Dashboard...');
  await page.evaluate(() => {
    const posTabs = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('positions') || b.textContent.includes('Positions') || b.textContent.includes('Posisi'));
    if (posTabs.length > 0) posTabs[0].click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({
    path: path.join(TARGET_DIR, 'my_positions.png'),
    fullPage: false,
  });

  // 5. Omni-Search Modal
  console.log('Capturing 5. Omni-Search Modal...');
  // Click search trigger in navbar
  await page.evaluate(() => {
    const searchBar = Array.from(document.querySelectorAll('header button')).find(b => b.textContent.includes('Search') || b.textContent.includes('Cari'));
    if (searchBar) searchBar.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({
    path: path.join(TARGET_DIR, 'omni_search.png'),
    fullPage: false,
  });

  // Close search modal
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 400));

  // 6. Shortcuts Modal
  console.log('Capturing 6. Pro Keyboard Shortcuts Modal...');
  await page.keyboard.press('?');
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({
    path: path.join(TARGET_DIR, 'shortcuts_modal.png'),
    fullPage: false,
  });

  // Close shortcuts modal
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 400));

  // 7. Feature Status Modal (Bilingual & Roadmap)
  console.log('Capturing 7. Feature Status & Roadmap Modal...');
  await page.evaluate(() => {
    const statusBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Dev Status') || b.textContent.includes('Status Fitur'));
    if (statusBtn) statusBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({
    path: path.join(TARGET_DIR, 'feature_status.png'),
    fullPage: false,
  });

  console.log('All Light Mode screenshots captured successfully!');
  await browser.close();
}

capture().catch(err => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
