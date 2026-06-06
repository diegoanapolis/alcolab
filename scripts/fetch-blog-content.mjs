#!/usr/bin/env node
/**
 * Build-time fetch of the PRIVATE blog content into the app tree.
 *
 * The editorial blog content (posts + images) lives in a private repository
 * (default: diegoanapolis/alcolab-blog-content), NOT in this public repo.
 * Before `next build`, this script downloads that private repo's
 *   - content/blog/        -> content/blog/
 *   - public/images/blog/  -> public/images/blog/
 * using the GitHub REST API only (global fetch; no git, no extra deps), so it
 * works under any builder (Railpack/Nixpacks) regardless of git availability.
 *
 * Tolerant by design: if no token is available, or the download fails, it logs
 * a warning and exits 0, leaving existing files untouched — the build never
 * fails because of this step.
 *
 * Activation is DELIBERATE: only runs when BLOG_CONTENT_TOKEN is set. It does
 * NOT fall back to GITHUB_TOKEN, so reading from the private repo is never
 * silently enabled while writes still target the public repo. Flip read (this
 * var) and write (GITHUB_REPO_NAME=alcolab-blog-content) together.
 *
 * Env:
 *   - BLOG_CONTENT_TOKEN  (required to activate) : token with READ access
 *   - BLOG_CONTENT_REPO   (default "diegoanapolis/alcolab-blog-content")
 *   - BLOG_CONTENT_BRANCH (default "main")
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const REPO = process.env.BLOG_CONTENT_REPO || "diegoanapolis/alcolab-blog-content";
const BRANCH = process.env.BLOG_CONTENT_BRANCH || "main";
const TOKEN = process.env.BLOG_CONTENT_TOKEN || "";
const PREFIXES = ["content/blog/", "public/images/blog/"];
const TARGET_DIRS = ["content/blog", "public/images/blog"];

const root = process.cwd();
const log = (m) => console.log(`[fetch-blog-content] ${m}`);
const api = "https://api.github.com";
const gh = (p) =>
  fetch(`${api}/repos/${REPO}${p}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "alcolab-build",
    },
  });

if (!TOKEN) {
  log("BLOG_CONTENT_TOKEN not set — skipping private fetch (using existing files).");
  process.exit(0);
}

const main = async () => {
  // 1) list the whole tree (recursive) in one call
  const tRes = await gh(`/git/trees/${BRANCH}?recursive=1`);
  if (!tRes.ok) throw new Error(`trees ${tRes.status} ${tRes.statusText}`);
  const tree = (await tRes.json()).tree || [];
  const blobs = tree.filter(
    (e) => e.type === "blob" && PREFIXES.some((p) => e.path.startsWith(p)),
  );
  if (!blobs.length) throw new Error("no content/blog or public/images/blog entries found in private repo");

  // 2) download every blob into a temp staging dir (all-or-nothing)
  const stage = fs.mkdtempSync(path.join(os.tmpdir(), "blog-content-"));
  for (const b of blobs) {
    const bRes = await gh(`/git/blobs/${b.sha}`);
    if (!bRes.ok) throw new Error(`blob ${b.path}: ${bRes.status} ${bRes.statusText}`);
    const data = await bRes.json();
    const buf = Buffer.from(data.content, data.encoding || "base64");
    const out = path.join(stage, b.path);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, buf);
  }

  // 3) swap into place (replace target dirs so deletions propagate)
  for (const rel of TARGET_DIRS) {
    const src = path.join(stage, rel);
    const dst = path.join(root, rel);
    if (!fs.existsSync(src)) {
      log(`WARNING: ${rel} absent in private repo — keeping existing copy.`);
      continue;
    }
    fs.rmSync(dst, { recursive: true, force: true });
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.cpSync(src, dst, { recursive: true });
    log(`synced ${rel} (${countFiles(dst)} files).`);
  }
  fs.rmSync(stage, { recursive: true, force: true });
  log("private blog content fetched successfully (GitHub API).");
};

function countFiles(dir) {
  let n = 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    n += e.isDirectory() ? countFiles(path.join(dir, e.name)) : 1;
  }
  return n;
}

main().catch((err) => {
  // Never fail the build — keep whatever is present.
  log(`WARNING: fetch failed (${(err && err.message) || err}). Keeping existing files; build continues.`);
  process.exit(0);
});
