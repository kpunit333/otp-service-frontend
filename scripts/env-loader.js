const fs = require("fs");
const path = require("path");

/**
 * Robust .env line parser
 */
function parseEnv(src) {
  const result = {};
  if (!src) return result;

  const lines = src.toString().split(/\r?\n/);
  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith("#")) continue;

    const eqIdx = line.indexOf("=");
    if (eqIdx <= 0) continue;

    const key = line.slice(0, eqIdx).trim();
    let val = line.slice(eqIdx + 1).trim();

    // Remove wrapping quotes if present
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }

    result[key] = val;
  }
  return result;
}

/**
 * Detect --configuration argument from process.argv or process.env
 */
function detectConfiguration(args = process.argv) {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--configuration=")) {
      return arg.split("=")[1].trim();
    }
    if (arg === "--configuration" && i + 1 < args.length) {
      return args[i + 1].trim();
    }
  }

  // Fallback to npm config if invoked as `npm run dev --configuration=development`
  if (process.env.npm_config_configuration) {
    return process.env.npm_config_configuration.trim();
  }

  // Fallback to CONFIGURATION env variable
  if (process.env.CONFIGURATION) {
    return process.env.CONFIGURATION.trim();
  }

  return null;
}

/**
 * Load environment based on --configuration flag:
 * - If --configuration=<target>, .env is overridden with .env.<target>
 * - If no --configuration, only .env is used
 */
function loadConfigurationEnv(rootDir = process.cwd()) {
  const configName = detectConfiguration();
  const baseEnvPath = path.join(rootDir, ".env");
  let combinedEnv = {};

  // 1. Load base .env file
  if (fs.existsSync(baseEnvPath)) {
    try {
      const content = fs.readFileSync(baseEnvPath, "utf8");
      combinedEnv = { ...parseEnv(content) };
    } catch (err) {
      console.warn("[EnvLoader] Warning: Could not read .env file:", err.message);
    }
  }

  // 2. If --configuration is specified, override with .env.<target>
  if (configName) {
    const targetEnvPath = path.join(rootDir, `.env.${configName}`);
    if (fs.existsSync(targetEnvPath)) {
      try {
        const targetContent = fs.readFileSync(targetEnvPath, "utf8");
        const targetParsed = parseEnv(targetContent);
        combinedEnv = { ...combinedEnv, ...targetParsed };
        console.log(`[EnvLoader] Loaded .env overridden with .env.${configName}`);
      } catch (err) {
        console.warn(`[EnvLoader] Warning: Failed to read .env.${configName}:`, err.message);
      }
    } else {
      console.warn(`[EnvLoader] Warning: Specified --configuration=${configName}, but .env.${configName} was not found at ${targetEnvPath}. Using .env only.`);
    }
  } else {
    console.log("[EnvLoader] No --configuration specified. Using only .env");
  }

  // 3. Inject into process.env
  for (const [key, val] of Object.entries(combinedEnv)) {
    process.env[key] = val;
  }

  // Tell Next.js we have already processed the environment
  process.env.__NEXT_PROCESSED_ENV = "true";
  if (configName) {
    process.env.CONFIGURATION = configName;
  }

  return {
    configuration: configName,
    loadedEnv: combinedEnv,
  };
}

module.exports = {
  parseEnv,
  detectConfiguration,
  loadConfigurationEnv,
};
