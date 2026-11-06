const raw = process.env.APP_BASE_PATH || "./";
const assetPrefix = raw === "./" || raw === "." ? "." : raw.replace(/\/$/, "");
export default { output: "standalone", assetPrefix };
