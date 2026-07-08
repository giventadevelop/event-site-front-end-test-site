/**
 * HeyGen API client using curl.exe (works around Node TLS issues on some Windows setups).
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const API_BASE = 'https://api.heygen.com';

function curlRequest(method, urlPath, { apiKey, body, outFile, timeoutSec = 300 } = {}) {
  const url = `${API_BASE}${urlPath}`;
  const args = ['-sS', '-k', '-X', method, url, '-H', `X-Api-Key: ${apiKey}`];

  let bodyFile;
  if (body !== undefined) {
    bodyFile = path.join(os.tmpdir(), `heygen-body-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
    fs.writeFileSync(bodyFile, JSON.stringify(body), 'utf8');
    args.push('-H', 'Content-Type: application/json', '--data-binary', `@${bodyFile}`);
  }

  if (outFile) {
    args.push('-o', outFile);
  }

  args.push('--max-time', String(timeoutSec));

  const result = spawnSync('curl.exe', args, { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
  if (bodyFile) {
    try { fs.unlinkSync(bodyFile); } catch (_) { /* ignore */ }
  }

  if (result.error) {
    throw new Error(`curl failed: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(`curl exit ${result.status}: ${result.stderr || result.stdout}`);
  }

  if (outFile) {
    return fs.readFileSync(outFile, 'utf8');
  }
  return result.stdout;
}

function curlDownload(url, destPath, timeoutSec = 600) {
  const args = ['-sS', '-k', '-L', url, '-o', destPath, '--max-time', String(timeoutSec)];
  const result = spawnSync('curl.exe', args, { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
  if (result.error) throw new Error(`download failed: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`download exit ${result.status}: ${result.stderr}`);
}

function parseJson(text, label) {
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`Invalid JSON from ${label}: ${text.slice(0, 500)}`);
  }
}

function get(apiKey, urlPath) {
  const text = curlRequest('GET', urlPath, { apiKey });
  const json = parseJson(text, urlPath);
  if (json.error) throw new Error(`${urlPath}: ${json.error}`);
  return json;
}

function post(apiKey, urlPath, body) {
  const text = curlRequest('POST', urlPath, { apiKey, body });
  const json = parseJson(text, urlPath);
  if (json.error) throw new Error(`${urlPath}: ${json.error}`);
  return json;
}

function getVideoStatus(apiKey, videoId) {
  return get(apiKey, `/v1/video_status.get?video_id=${encodeURIComponent(videoId)}`);
}

function generateVideo(apiKey, payload) {
  return post(apiKey, '/v2/video/generate', payload);
}

function listAvatars(apiKey) {
  return get(apiKey, '/v2/avatars');
}

function listVoices(apiKey) {
  return get(apiKey, '/v2/voices');
}

module.exports = {
  curlDownload,
  generateVideo,
  getVideoStatus,
  listAvatars,
  listVoices,
};
