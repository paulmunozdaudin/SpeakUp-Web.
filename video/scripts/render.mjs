/**
 * Renders a props file to a vertical 1080x1920 MP4 in video/out/.
 *
 *   npm run render -- props/my-ad.json
 *
 * Set CHROME_PATH to use an already-installed Chrome/Chromium instead of
 * letting Remotion download its own.
 */
import { spawnSync } from "node:child_process";
import { basename } from "node:path";

const [propsPath] = process.argv.slice(2);
if (!propsPath) {
  console.error("Usage: npm run render -- props/my-ad.json");
  process.exit(1);
}
const out = `out/${basename(propsPath, ".json")}.mp4`;
const args = [
  "remotion",
  "render",
  "src/index.ts",
  "EloqAd",
  out,
  `--props=${propsPath}`,
  "--codec=h264",
  "--crf=18",
];
if (process.env.CHROME_PATH) args.push(`--browser-executable=${process.env.CHROME_PATH}`);
const result = spawnSync("npx", args, { stdio: "inherit" });
if (result.status === 0) console.log(`\nDone: video/${out}`);
process.exit(result.status ?? 1);
