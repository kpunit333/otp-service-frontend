const path = require("path");
const { spawn, execSync } = require("child_process");
const { loadConfigurationEnv } = require("./env-loader");

// 1. Process environment overrides based on --configuration
loadConfigurationEnv(process.cwd());

// 2. Filter out --configuration from CLI arguments so Next.js binary doesn't reject it
const rawArgs = process.argv.slice(2);
const cleanArgs = [];

for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i];
  if (arg.startsWith("--configuration=")) {
    continue;
  }
  if (arg === "--configuration") {
    i++; // skip value
    continue;
  }
  cleanArgs.push(arg);
}

// 3. Resolve path to next CLI
const nextBin = path.join(__dirname, "..", "node_modules", "next", "dist", "bin", "next");

const childProcess = spawn(process.execPath, [nextBin, ...cleanArgs], {
  stdio: "inherit",
  env: process.env,
  cwd: process.cwd(),
});

childProcess.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 0);
  }
});

// Graceful termination handling
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
