/**
 * GitHub-based persistence for admin edits.
 *
 * Railway's filesystem is ephemeral: files written by the app (blog edits,
 * uploaded images) are lost on every redeploy.  To keep edits permanent we
 * mirror every admin write to the GitHub repo via the Contents API, using
 * a fine-grained token stored as GITHUB_TOKEN.
 *
 * If GITHUB_TOKEN is missing (e.g., local dev), we silently skip the sync —
 * the filesystem copy is still written, so the admin keeps working locally.
 *
 * Isolation test: this file should be updatable without touching any blog
 * content.  That is the whole point — code commits live here in src/**,
 * content commits live under content/ and public/images/.
 */
import fs from "fs";
import path from "path";

const OWNER = process.env.GITHUB_REPO_OWNER || "diegoanapolis";
const REPO = process.env.GITHUB_REPO_NAME || "alcolab";
const BRANCH = process.env.GITHUB_BRANCH || "main";
const API = "https://api.github.com";

function token(): string | null {
  const t = process.env.GITHUB_TOKEN;
  if (!t) return null;
  return t;
}

function headers(t: string) {
  return {
    Authorization: `Bearer ${t}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };
}

/**
 * GET the SHA of an existing file on GitHub.  Returns null if the file
 * doesn't exist (GitHub returns 404) or if we can't reach the API.
 */
async function getFileSha(
  t: string,
  repoPath: string,
): Promise<string | null> {
  try {
    const url = `${API}/repos/${OWNER}/${REPO}/contents/${encodeURI(repoPath)}?ref=${BRANCH}`;
    const res = await fetch(url, { headers: headers(t) });
    if (res.status === 404) return null;
    if (!res.ok) {
      console.error(
        `[github-sync] getFileSha ${repoPath}: ${res.status} ${res.statusText}`,
      );
      return null;
    }
    const data = (await res.json()) as { sha?: string };
    return data.sha || null;
  } catch (err) {
    console.error(`[github-sync] getFileSha error for ${repoPath}:`, err);
    return null;
  }
}

/**
 * Commit a file (create or update) to the GitHub repo.
 * `repoPath` is the path relative to the repo root (e.g. "content/blog/pt/foo.md").
 * Content can be a string (utf-8) or a Buffer (binary, e.g. images).
 *
 * Returns true on success, false if skipped or failed.  Never throws —
 * failures are logged and the caller continues (filesystem write succeeded).
 */
export async function commitFileToGitHub(
  repoPath: string,
  content: string | Buffer,
  message: string,
): Promise<boolean> {
  const t = token();
  if (!t) {
    console.warn(
      `[github-sync] GITHUB_TOKEN not set — skipping sync of ${repoPath}`,
    );
    return false;
  }

  try {
    const base64 = Buffer.isBuffer(content)
      ? content.toString("base64")
      : Buffer.from(content, "utf-8").toString("base64");

    const sha = await getFileSha(t, repoPath);

    const body: Record<string, unknown> = {
      message,
      content: base64,
      branch: BRANCH,
    };
    if (sha) body.sha = sha;

    const url = `${API}/repos/${OWNER}/${REPO}/contents/${encodeURI(repoPath)}`;
    const res = await fetch(url, {
      method: "PUT",
      headers: headers(t),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error(
        `[github-sync] PUT ${repoPath} failed: ${res.status} ${res.statusText} — ${errText.slice(0, 300)}`,
      );
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[github-sync] commit error for ${repoPath}:`, err);
    return false;
  }
}

/**
 * Delete a file from the GitHub repo.  No-op if the file doesn't exist there.
 */
export async function deleteFileFromGitHub(
  repoPath: string,
  message: string,
): Promise<boolean> {
  const t = token();
  if (!t) return false;

  try {
    const sha = await getFileSha(t, repoPath);
    if (!sha) return false; // nothing to delete on GitHub

    const url = `${API}/repos/${OWNER}/${REPO}/contents/${encodeURI(repoPath)}`;
    const res = await fetch(url, {
      method: "DELETE",
      headers: headers(t),
      body: JSON.stringify({ message, sha, branch: BRANCH }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error(
        `[github-sync] DELETE ${repoPath} failed: ${res.status} — ${errText.slice(0, 300)}`,
      );
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[github-sync] delete error for ${repoPath}:`, err);
    return false;
  }
}

/**
 * Helper: sync a local file (by absolute path) to its mirror location on
 * GitHub.  The repo path is derived by stripping process.cwd().
 */
export async function syncLocalFile(
  absPath: string,
  message: string,
): Promise<boolean> {
  const root = process.cwd();
  if (!absPath.startsWith(root)) {
    console.error(`[github-sync] path outside cwd: ${absPath}`);
    return false;
  }
  const repoPath = path
    .relative(root, absPath)
    .split(path.sep)
    .join("/");

  if (!fs.existsSync(absPath)) {
    return deleteFileFromGitHub(repoPath, message);
  }

  // Detect binary by extension for images, read as Buffer; otherwise utf-8
  const ext = path.extname(absPath).toLowerCase();
  const binaryExts = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".ico"];
  const content = binaryExts.includes(ext)
    ? fs.readFileSync(absPath)
    : fs.readFileSync(absPath, "utf-8");
  return commitFileToGitHub(repoPath, content, message);
}

export function isSyncConfigured(): boolean {
  return !!token();
}
