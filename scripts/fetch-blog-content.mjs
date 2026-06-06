#!/usr/bin/env node
/**
 * Build-time fetch of the PRIVATE blog content into the app tree.
 *
 * The editorial blog content (posts + images) lives in a private repository
 * (default: diegoanapolis/alcolab-blog-content), NOT in this public repo.
 * Before `next build`, this script clones that private repo and copies:
 *   - content/blog/        -> content/blog/
 *   - public/images/blog/  -> public/images/blog/
 *
 * Tolerant by design: if no token is available (e.g. local dev or a build
 * without the secret configured), it logs a warning and exits 0, leaving any
 * existing files untouched — so the build never fails because of this step.
 *
 * Activation is DELIBERATE: the private fetch only runs when BLOG_CONTENT_TOKEN
 * is set. It intentionally does NOT fall back to GITHUB_TOKEN, so that reading
 * from the private repo is never silently enabled while writes still target the
 * public repo (which would lose admin edits). Flip read (this var) and write
 * (GITHUB_REPO_NAME=alcolab-blog-content) together.
 *
 * Required env (set in Railway) to activate the private fetch:
 *   - BLOG_CONTENT_TOKEN : token with READ access to the private content repo
 * Optional:
 *   - BLOG_CONTENT_REPO   (default "diegoanapolis/alcolab-blog-content")
 *   - BLOG_CONTENT_BRANCH (default "main")
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const REPO = process.env.BLOG_CONTENT_REPO || "diegoanapolis/alcolab-blog-content";
const BRANCH = process.env.BLOG_CONTENT_BRANCH || "main";
const TOKEN = process.env.BLOG_CONTENT_TOKEN || "";

// Folders mirrored from the private repo into this repo (same relative paths).
const PATHS = ["content/blog", "public/images/blog"];

const root = process.cwd();
const log = (m) => console.log(`[fetch-blog-content] ${m}`);

if (!TOKEN) {
  log("BLOG_CONTENT_TOKEN not set — skipping private fetch (using existing files).");
  process.exit(0);
}

let tmp;
try {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "blog-content-"));
  const url = `https://x-access-token:${TOKEN}@github.com/${REPO}.git`;
  log(`cloning ${REPO}#${BRANCH} ...`);
  // --depth 1: only the latest snapshot. Token is passed inline to the temp clone only.
  execSync(`git clone --depth 1 --branch ${BRANCH} ${url} "${tmp}"`, {
    stdio: ["ignore", "ignore", "inherit"],
  });

  for (const rel of PATHS) {
    const srcDir = path.join(tmp, rel);
    const dstDir = path.join(root, rel);
    if (!fs.existsSync(srcDir)) {
      log(`WARNING: ${rel} not found in private repo — leaving existing copy as-is.`);
      continue;
    }
    // Replace the target folder entirely so deletions in the private repo propagate.
    fs.rmSync(dstDir, { recursive: true, force: true });
    fs.mkdirSync(path.dirname(dstDir), { recursive: true });
    fs.cpSync(srcDir, dstDir, { recursive: true });
    log(`synced ${rel} (${countFiles(dstDir)} files).`);
  }
  log("private blog content fetched successfully.");
} catch (err) {
  // Never fail the build because of content fetch — keep whatever is present.
  log(`WARNING: fetch failed (${(err && err.message) || err}). Keeping existing files; build continues.`);
} finally {
  if (tmp) {
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch {}
  }
}

function countFiles(dir) {
  let n = 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    n += e.isDirectory() ? countFiles(path.join(dir, e.name)) : 1;
  }
  return n;
}
