const fs = require("fs");
const path = require("path");
const { spawn, execSync } = require("child_process");

const NEXT_COMMANDS = new Set(["dev", "build", "start", "lint", "info", "telemetry"]);

/**
 * Normalizes configuration name to canonical values:
 * 'dev' | 'staging' | 'prod'
 */
function normalizeConfiguration(config) {
  if (!config) return "";
  const lower = config.toLowerCase().trim();
  // if (lower === "dev" || lower === "development" || lower === "local") {
  //   return "dev";
  // }
  // if (lower === "staging" || lower === "stage" || lower === "uat" || lower === "test") {
  //   return "staging";
  // }
  // if (lower === "prod" || lower === "production") {
  //   return "prod";
  // }
  return lower;
}

/**
 * Extract configuration name from CLI arguments
 */
function detectConfiguration(args = process.argv.slice(2)) {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    // --configuration=xyz or -c=xyz
    if (arg.startsWith("--configuration=")) {
      return arg.split("=")[1].trim();
    }
    if (arg.startsWith("-c=")) {
      return arg.split("=")[1].trim();
    }

    // --configuration xyz or -c xyz
    if ((arg === "--configuration" || arg === "-c") && i + 1 < args.length) {
      return args[i + 1].trim();
    }

    // Direct positional argument e.g. `node switch-env.js staging`
    if (
      !arg.startsWith("-") &&
      !NEXT_COMMANDS.has(arg.toLowerCase()) &&
      ["dev", "development", "staging", "stage", "prod", "production"].includes(
        arg.toLowerCase()
      )
    ) {
      return arg.trim();
    }
  }

  // Fallback to npm config if invoked as `npm run ... --configuration=staging`
  if (process.env.npm_config_configuration) {
    return process.env.npm_config_configuration.trim();
  }

  return "";
}

/**
 * Replace the content of environment/env.ts with the content of the corresponding env.<configuration>.ts
 */
function switchEnv(rootDir = process.cwd(), customArgs = process.argv.slice(2)) {
  const detected = detectConfiguration(customArgs);
  const targetConfig = normalizeConfiguration(detected);

  const envDir = path.join(rootDir, "environment");
  const sourceFileName = targetConfig ? `env.${targetConfig}.ts` : "env.ts";
  const sourcePath = path.join(envDir, sourceFileName);
  const targetPath = path.join(envDir, "env.ts");

  if (!fs.existsSync(sourcePath)) {
    const available = fs
      .readdirSync(envDir)
      .filter((f) => f.startsWith("env.") && f !== "env.ts" && f !== "env.base.ts");
    throw new Error(
      `[switch-env] Configuration file "${sourceFileName}" not found at ${sourcePath}. Available: ${available.join(", ")}`
    );
  }

  const content = fs.readFileSync(sourcePath, "utf8");
  fs.writeFileSync(targetPath, content, "utf8");

  console.log(`[switch-env] Switched environment/env.ts -> ${sourceFileName} (${targetConfig})`);

  return targetConfig;
}

/**
 * Run Next.js CLI with stripped configuration flags
 */
function runNextApp(rootDir, args) {
  const cleanArgs = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--configuration=") || arg.startsWith("-c=")) {
      continue;
    }
    if (arg === "--configuration" || arg === "-c") {
      if (i + 1 < args.length) {
        i++;
      }
      continue;
    }
    cleanArgs.push(arg);
  }

  const nextBin = path.join(rootDir, "node_modules", "next", "dist", "bin", "next");

  const childProcess = spawn(process.execPath, [nextBin, ...cleanArgs], {
    stdio: "inherit",
    env: process.env,
    cwd: rootDir,
  });

  childProcess.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
    } else {
      process.exit(code ?? 0);
    }
  });

  const handleShutdown = () => {
    if (childProcess && childProcess.pid) {
      try {
        if (process.platform === "win32") {
          execSync(`taskkill /pid ${childProcess.pid} /T /F`, { stdio: "ignore" });
        } else {
          childProcess.kill("SIGTERM");
        }
      } catch {
        // Ignore if already exited
      }
    }
    process.exit(0);
  };

  process.on("SIGINT", handleShutdown);
  process.on("SIGTERM", handleShutdown);
}

function main() {
  const rootDir = process.cwd();
  const rawArgs = process.argv.slice(2);

  // 1. Switch the environment configuration file
  switchEnv(rootDir, rawArgs);

  // 2. If a Next.js command was specified (e.g. dev, build, start), execute it
  const hasNextCommand = rawArgs.some((arg) => NEXT_COMMANDS.has(arg.toLowerCase()));
  if (hasNextCommand) {
    runNextApp(rootDir, rawArgs);
  }
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

module.exports = {
  detectConfiguration,
  normalizeConfiguration,
  switchEnv,
};
