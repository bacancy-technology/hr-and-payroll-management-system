import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const envFiles = [".env", ".env.production", ".env.local", ".env.production.local"];

function stripWrappingQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function parseEnvFile(filePath) {
  const entries = [];
  const fileContents = fs.readFileSync(filePath, "utf8");

  for (const line of fileContents.split(/\r?\n/)) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const rawValue = trimmedLine.slice(separatorIndex + 1).trim();

    if (!key) {
      continue;
    }

    entries.push([key, stripWrappingQuotes(rawValue)]);
  }

  return entries;
}

const runtimeEnv = { ...process.env };

for (const envFile of envFiles) {
  const envFilePath = path.resolve(process.cwd(), envFile);

  if (!fs.existsSync(envFilePath)) {
    continue;
  }

  for (const [key, value] of parseEnvFile(envFilePath)) {
    if (process.env[key] !== undefined) {
      continue;
    }

    runtimeEnv[key] = value;
  }
}

const serverProcess = spawn(process.execPath, [path.resolve(".next/standalone/server.js")], {
  env: runtimeEnv,
  stdio: "inherit",
});

serverProcess.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});

