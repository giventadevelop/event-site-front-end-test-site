/**
 * Parse narration blocks from Gas Station COO script HTML files.
 */
const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(
  __dirname,
  '../../documentation/tenant_management/gas_station_site/videos'
);

function decodeHtml(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractNarrations(html, idPattern) {
  const regex = new RegExp(
    `<pre\\s+class="narration"\\s+id="(${idPattern})"[^>]*>([\\s\\S]*?)<\\/pre>`,
    'gi'
  );
  const items = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    const id = match[1];
    const text = decodeHtml(match[2].trim());
    items.push({ id, text });
  }
  return items;
}

function sortBySceneNumber(a, b) {
  const numA = parseInt(a.id.match(/-(\d+)/)?.[1] || '0', 10);
  const numB = parseInt(b.id.match(/-(\d+)/)?.[1] || '0', 10);
  return numA - numB;
}

function loadScriptPackage() {
  const investorHtml = fs.readFileSync(
    path.join(DOCS_DIR, 'gas_station_video_scripts_investor.html'),
    'utf8'
  );
  const developerHtml = fs.readFileSync(
    path.join(DOCS_DIR, 'gas_station_video_scripts_developer.html'),
    'utf8'
  );

  const investorFull = extractNarrations(investorHtml, 'inv-f-\\d+-n').sort(sortBySceneNumber);
  const investorSeries = extractNarrations(investorHtml, 'inv-s\\d+-n').sort(sortBySceneNumber);
  const developerFull = extractNarrations(developerHtml, 'dev-f-\\d+-n').sort(sortBySceneNumber);
  const developerSeries = extractNarrations(developerHtml, 'dev-s\\d+-n').sort(sortBySceneNumber);

  return {
    investorFull,
    investorSeries,
    developerFull,
    developerSeries,
  };
}

function episodeTitle(htmlPath, episodeId) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const blockRe = new RegExp(
    `<div\\s+class="episode"\\s+id="${episodeId}"[^>]*>[\\s\\S]*?<h2>([\\s\\S]*?)<\\/h2>`,
    'i'
  );
  const m = html.match(blockRe);
  if (!m) return episodeId;
  return decodeHtml(m[1].replace(/<[^>]+>/g, '').trim());
}

function buildJobs(scripts) {
  const investorHtml = path.join(DOCS_DIR, 'gas_station_video_scripts_investor.html');
  const developerHtml = path.join(DOCS_DIR, 'gas_station_video_scripts_developer.html');

  const jobs = [];

  for (const ep of scripts.investorSeries) {
    jobs.push({
      key: ep.id.replace('-n', ''),
      audience: 'investor',
      kind: 'series',
      title: `Investor — ${episodeTitle(investorHtml, ep.id.replace('-n', ''))}`,
      scenes: [{ id: ep.id, text: ep.text }],
      outputFile: `investor/series/${ep.id.replace('-n', '')}.mp4`,
    });
  }

  for (const ep of scripts.developerSeries) {
    jobs.push({
      key: ep.id.replace('-n', ''),
      audience: 'developer',
      kind: 'series',
      title: `Developer — ${episodeTitle(developerHtml, ep.id.replace('-n', ''))}`,
      scenes: [{ id: ep.id, text: ep.text }],
      outputFile: `developer/series/${ep.id.replace('-n', '')}.mp4`,
    });
  }

  jobs.push({
    key: 'inv-full',
    audience: 'investor',
    kind: 'full',
    title: 'Investor — Full presentation (~30 min)',
    scenes: scripts.investorFull.map((s) => ({ id: s.id, text: s.text })),
    outputFile: 'investor/full/gas-station-coo-investor-full.mp4',
  });

  jobs.push({
    key: 'dev-full',
    audience: 'developer',
    kind: 'full',
    title: 'Developer — Full walkthrough (~35 min)',
    scenes: scripts.developerFull.map((s) => ({ id: s.id, text: s.text })),
    outputFile: 'developer/full/gas-station-coo-developer-full.mp4',
  });

  return jobs;
}

module.exports = {
  DOCS_DIR,
  buildJobs,
  loadScriptPackage,
};
