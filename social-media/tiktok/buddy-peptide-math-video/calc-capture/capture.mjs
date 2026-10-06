// Usage: node calc-capture/capture.mjs <outDir> <peptide> <vialMg> <waterMl> <doseMg> [en|pt|es]. Needs playwright-core (npm i --no-save playwright-core) and Chrome.
import {chromium} from 'playwright-core';
import fs from 'node:fs';
const [,, outDir, peptide, vial, water, dose, loc = 'en'] = process.argv;
import {readFileSync} from 'node:fs';
const MSG = JSON.parse(readFileSync(new URL('../../../../messages/' + loc + '.json', import.meta.url), 'utf8'));
const C = MSG.calculator;
const base = loc === 'en' ? 'https://www.buddypept.com' : 'https://www.buddypept.com/' + loc;
const BS = String.fromCharCode(92);
const esc = (x) => Array.from(x).map((ch) => ('.*+?^${}()|[]'.includes(ch) || ch === BS ? BS + ch : ch)).join('');
fs.mkdirSync(outDir, {recursive: true});
const browser = await chromium.launch({channel: 'chrome', headless: true});
const ctx = await browser.newContext({viewport: {width: 540, height: 960}, deviceScaleFactor: 2, colorScheme: 'dark'});
const page = await ctx.newPage();
const frames = []; const targets = {};
let n = 0;
const shot = async (tag) => { const f = `f${String(n++).padStart(3, '0')}_${tag}.png`; await page.screenshot({path: `${outDir}/${f}`}); frames.push({file: f, tag}); return f; };
const box = async (name, loc) => { const b = await loc.boundingBox(); targets[name] = {x: b.x * 2, y: b.y * 2, w: b.width * 2, h: b.height * 2}; };
const settle = () => page.waitForTimeout(350);
await page.goto(base + '/', {waitUntil: 'networkidle'});
await page.waitForTimeout(600);
await shot('home'); const openBtn = page.getByRole('link', {name: new RegExp(esc(MSG.home.openCalculator))}).first(); await box('home_open', openBtn); await openBtn.click(); await page.waitForURL(/calculator/); await page.waitForLoadState('networkidle'); await page.waitForTimeout(500);


// step 1: pick compound
const input = page.getByPlaceholder(C.peptide.placeholder);
await shot('s1_empty'); await box('s1_input', input);
await input.click(); await settle(); await shot('s1_focus');
for (let i = 0; i < peptide.length; i++) {
  if (i % 2 === 1 || i === peptide.length - 1) {
    // Each typing frame comes from a fresh page: sequential edits leave the dropdown's request row one character behind on the live site.
    const p3 = await ctx.newPage();
    await p3.goto(base + '/calculator', {waitUntil: 'networkidle'});
    const i3 = p3.getByPlaceholder(C.peptide.placeholder);
    await i3.click(); await i3.fill(peptide.slice(0, i + 1)); await p3.waitForTimeout(600);
    const f3 = `f${String(n++).padStart(3, '0')}_s1_type.png`;
    await p3.screenshot({path: `${outDir}/${f3}`}); frames.push({file: f3, tag: 's1_type'});
    await p3.close();
  }
}
await input.fill(peptide); await page.waitForTimeout(300);
await page.waitForTimeout(1800);
console.log('list', (await page.locator('#peptide-picker-list [role=option]').allInnerTexts()).join(' | '));
const opt = page.locator('#peptide-picker-list [role=option]').filter({hasText: new RegExp('^' + peptide + '$')}).first();
{
  // Clean dropdown shot from a fresh page: sequential edits leave the "Request" row one character behind on the live site.
  const p2 = await ctx.newPage();
  await p2.goto(base + '/calculator', {waitUntil: 'networkidle'});
  const i2 = p2.getByPlaceholder(C.peptide.placeholder);
  await i2.click(); await i2.fill(peptide); await p2.waitForTimeout(800);
  const o2 = p2.locator('#peptide-picker-list [role=option]').filter({hasText: new RegExp('^' + peptide + '$')}).first();
  const f = `f${String(n++).padStart(3, '0')}_s1_list.png`;
  await p2.screenshot({path: `${outDir}/${f}`}); frames.push({file: f, tag: 's1_list'});
  const b = await o2.boundingBox(); targets['s1_option'] = {x: b.x * 2, y: b.y * 2, w: b.width * 2, h: b.height * 2};
  console.log('clean list', (await p2.locator('#peptide-picker-list [role=option]').allInnerTexts()).join(' | '));
  await p2.close();
}
await opt.click(); await settle(); await shot('s1_picked');
const cont = page.getByRole('button', {name: new RegExp(esc(C.continue))});
await box('s1_continue', cont); await cont.click(); await settle();
// step 2: powder
const powder = page.getByText(C.form.powderTitle); await shot('s2'); await box('s2_powder', powder);
await powder.click(); await settle(); await shot('s2_picked');
await box('s2_continue', cont); await cont.click(); await settle();
// step 3: vial amount
const num = page.locator('main input[type=number]').first();
await shot('s3_empty'); await box('s3_input', num); await num.click(); await settle();
for (const ch of vial) { await num.pressSequentially(ch); await page.waitForTimeout(120); await shot('s3_type'); }
await box('s3_continue', cont); await cont.click(); await settle();
// step 4: water
await shot('s4_empty'); await box('s4_input', num); await num.click(); await settle();
for (const ch of water) { await num.pressSequentially(ch); await page.waitForTimeout(120); await shot('s4_type'); }
await box('s4_continue', cont); await cont.click(); await settle();
// step 5: syringe
const syr = page.getByRole('button', {name: new RegExp(esc(C.barrel.insulin10.label.split(' (')[0]))});
await shot('s5'); await box('s5_syringe', syr); await syr.click(); await settle(); await shot('s5_picked');
await box('s5_continue', cont); await cont.click(); await settle();
// step 6: dose
await shot('s6_empty');
const ph = await num.getAttribute('placeholder'); console.log('dose placeholder', ph);
if (!/0[.,]25/.test(ph || '')) { const mgBtn = page.getByRole('button', {name: /^mg$/}); await box('s6_unit', mgBtn); await mgBtn.click(); await settle(); await shot('s6_unit'); }
await box('s6_input', num); await num.click(); await settle();
for (const ch of dose) { await num.pressSequentially(ch); await page.waitForTimeout(120); await shot('s6_type'); }
const calc = page.getByRole('button', {name: new RegExp(esc(C.calculate))});
await box('s6_calc', calc); await calc.click(); await page.waitForTimeout(1200);
await shot('result');
const resultText = (await page.locator('main').innerText()).replace(/\n+/g, ' / ');
await page.evaluate(() => window.scrollTo(0, 400)); await page.waitForTimeout(400); await shot('result_scrolled');
fs.writeFileSync(`${outDir}/manifest.json`, JSON.stringify({peptide, vial, water, dose, frames, targets, resultText}, null, 1));
console.log(resultText.slice(0, 700));
console.log(frames.length, 'frames');
await browser.close();
