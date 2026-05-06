import { spawnSync } from "node:child_process";

const failed = [];

for (let batch = 1; batch <= 40; batch += 1) {
  const result = spawnSync(process.execPath, ["scripts/validate-repair-batch.mjs", String(batch)], {
    encoding: "utf8",
    stdio: "pipe"
  });

  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);

  if (result.status !== 0) {
    failed.push(batch);
  }
}

if (failed.length > 0) {
  console.error(`Repair validation failed for batches: ${failed.join(", ")}`);
  process.exit(1);
}

console.log("All repair batches passed.");
