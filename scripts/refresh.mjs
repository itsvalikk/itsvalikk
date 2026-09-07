#!/usr/bin/env node
// Rewrites only the text between the NOW and SHIPS marker pairs in README.md.
// Everything outside those markers is left byte for byte alone.
//
// Privacy rule, and it is the reason this file is shaped the way it is:
// no repository may be named in generated text unless it is on ALLOWED_REPOS.
// That is a default deny list, not a default allow list, so a private
// repository is excluded because its name is absent, and its name never has to
// be written down in this public file in order to keep it out.
//
// Local use:
//   GITHUB_TOKEN=... node scripts/refresh.mjs             write README.md
//   GITHUB_TOKEN=... node scripts/refresh.mjs --dry-run   print, write nothing
//   node scripts/refresh.mjs --dry-run --offline          no network, no token

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const README_PATH = join(ROOT, 'README.md');
const NOW_SOURCE_PATH = join(ROOT, 'data', 'now.md');

const OWNER = process.env.PROFILE_OWNER || 'itsvalikk';
const WINDOW_DAYS = 30;
const MAX_PAGES = 3;

const ALLOWED_REPOS = new Set(
  [OWNER + '/' + OWNER, OWNER + '/mindforge-lab'].map((name) => name.toLowerCase()),
);

const argv = new Set(process.argv.slice(2));
const DRY_RUN = argv.has('--dry-run');
const OFFLINE = argv.has('--offline');

function fail(message) {
  console.error('refresh: ' + message);
  process.exit(1);
}

// Progress goes to stderr so that stdout carries the rendered README and
// nothing else. `node scripts/refresh.mjs --dry-run > preview.md` is then clean.
function log(message) {
  console.error('refresh: ' + message);
}

function plural(count, one, many) {
  return count === 1 ? one : many;
}

for (const arg of argv) {
  if (arg !== '--dry-run' && arg !== '--offline') {
    fail('unknown argument "' + arg + '". Supported: --dry-run, --offline');
  }
}

// Any owner/name shaped token. Used as a last gate before writing, so a future
// change to the block builders cannot quietly start leaking repository names.
const REPO_PATH_PATTERN = /\b[A-Za-z0-9][A-Za-z0-9-]{0,38}\/[A-Za-z0-9._-]{1,100}\b/g;
// The trailing character class excludes a dot so that a sentence ending in
// ".../mindforge-lab." is not read as a repository literally named "lab.".
const GITHUB_URL_PATTERN = /https?:\/\/(?:www\.)?github\.com\/([A-Za-z0-9-]+\/(?:[A-Za-z0-9._-]*[A-Za-z0-9_-])?)/gi;

function assertNoUnapprovedRepo(block, label) {
  const hits = block.match(REPO_PATH_PATTERN) || [];
  for (const hit of hits) {
    if (!ALLOWED_REPOS.has(hit.toLowerCase())) {
      fail(label + ' block names "' + hit + '", which is not on the allowlist. Nothing written.');
    }
  }
}

function assertNoUnapprovedGithubUrl(block, label) {
  for (const match of block.matchAll(GITHUB_URL_PATTERN)) {
    const repo = match[1].replace(/\.git$/i, '').toLowerCase();
    if (!ALLOWED_REPOS.has(repo)) {
      fail(label + ' block links to github.com/' + match[1] + ', which is not on the allowlist. Nothing written.');
    }
  }
}

function replaceBlock(source, name, body) {
  const open = '<!-- ' + name + ':START -->';
  const close = '<!-- ' + name + ':END -->';
  const start = source.indexOf(open);
  const end = source.indexOf(close);
  if (start === -1) fail('marker ' + open + ' not found in README.md');
  if (end === -1) fail('marker ' + close + ' not found in README.md');
  if (end < start) fail('marker ' + close + ' appears before ' + open + ' in README.md');
  const head = source.slice(0, start + open.length);
  const tail = source.slice(end);
  return head + '\n' + body.trim() + '\n' + tail;
}

async function githubJson(path) {
  const headers = {
    accept: 'application/vnd.github+json',
    'x-github-api-version': '2022-11-28',
    'user-agent': OWNER + '-profile-refresh',
  };
  if (process.env.GITHUB_TOKEN) {
    headers.authorization = 'Bearer ' + process.env.GITHUB_TOKEN;
  }
  const response = await fetch('https://api.github.com' + path, { headers });
  if (!response.ok) {
    const remaining = response.headers.get('x-ratelimit-remaining');
    const note = remaining === '0' ? ' (rate limit exhausted)' : '';
    fail('GET ' + path + ' returned ' + response.status + note);
  }
  return response.json();
}

// Public events only. The endpoint itself excludes private activity, and the
// allowlist gate below excludes anything that is not explicitly approved.
async function collectPublicActivity() {
  const cutoff = Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const touched = new Set();
  let commits = 0;

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const events = await githubJson('/users/' + OWNER + '/events/public?per_page=100&page=' + page);
    if (!Array.isArray(events) || events.length === 0) break;
    for (const event of events) {
      if (event.public === false) continue;
      if (event.type !== 'PushEvent') continue;
      const created = Date.parse(event.created_at);
      if (!Number.isFinite(created) || created < cutoff) continue;
      const name = String(event.repo && event.repo.name ? event.repo.name : '').toLowerCase();
      if (!ALLOWED_REPOS.has(name)) continue;
      const payload = event.payload || {};
      const size = Number(payload.distinct_size);
      commits += Number.isFinite(size) ? size : 0;
      touched.add(name);
    }
    if (events.length < 100) break;
  }

  return { commits: commits, repoCount: touched.size };
}

async function countPublicRepos() {
  let total = 0;
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const repos = await githubJson('/users/' + OWNER + '/repos?type=owner&per_page=100&page=' + page);
    if (!Array.isArray(repos) || repos.length === 0) break;
    total += repos.filter((repo) => repo.private !== true && repo.visibility === 'public').length;
    if (repos.length < 100) break;
  }
  return total;
}

// Only integers reach this template. No string from the API is interpolated,
// so there is no path by which a repository name or description can land here.
function buildShipsBlock(counters) {
  const commits = counters.commits;
  const repoCount = counters.repoCount;
  const publicRepos = counters.publicRepos;
  const lines = [];

  if (commits === 0) {
    lines.push('No public commits in the last ' + WINDOW_DAYS + ' days.');
  } else {
    lines.push(
      commits + ' public ' + plural(commits, 'commit', 'commits') +
      ' in the last ' + WINDOW_DAYS + ' days, across ' +
      repoCount + ' public ' + plural(repoCount, 'repository', 'repositories') + '.',
    );
  }
  lines.push('');
  lines.push(publicRepos + ' public ' + plural(publicRepos, 'repository', 'repositories') + ' on this account.');
  return lines.join('\n');
}

async function readNowBlock() {
  if (!existsSync(NOW_SOURCE_PATH)) return null;
  const text = (await readFile(NOW_SOURCE_PATH, 'utf8')).trim();
  return text.length > 0 ? text : null;
}

async function main() {
  if (OFFLINE && !DRY_RUN) {
    fail('--offline renders zeroed counters, so it is only allowed together with --dry-run');
  }
  if (!OFFLINE && !process.env.GITHUB_TOKEN) {
    fail('GITHUB_TOKEN is not set. Set it, or run with --dry-run --offline.');
  }

  const original = await readFile(README_PATH, 'utf8');
  let next = original;

  const now = await readNowBlock();
  if (now === null) {
    log('NOW: data/now.md is missing or empty, block left untouched.');
  } else {
    assertNoUnapprovedGithubUrl(now, 'NOW');
    next = replaceBlock(next, 'NOW', now);
  }

  let counters;
  if (OFFLINE) {
    counters = { commits: 0, repoCount: 0, publicRepos: 0 };
    log('SHIPS: offline, template rendered with zeroed counters.');
  } else {
    const activity = await collectPublicActivity();
    const publicRepos = await countPublicRepos();
    counters = { commits: activity.commits, repoCount: activity.repoCount, publicRepos: publicRepos };
  }

  const ships = buildShipsBlock(counters);
  assertNoUnapprovedRepo(ships, 'SHIPS');
  next = replaceBlock(next, 'SHIPS', ships);

  if (next === original) {
    log('README.md is unchanged.');
    return;
  }

  if (DRY_RUN) {
    log('README.md would change. Nothing written because of --dry-run.');
    process.stdout.write(next);
    return;
  }

  await writeFile(README_PATH, next, 'utf8');
  log('README.md updated.');
}

main().catch((error) => fail(error && error.stack ? error.stack : String(error)));
