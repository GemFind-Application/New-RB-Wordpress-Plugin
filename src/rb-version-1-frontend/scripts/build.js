/**
 * Production build straight into the folder WordPress serves (GEMFINDRB_Shortcode enqueues these):
 *
 *   ../../public/static/js/frontend-v1.js
 *   ../../public/static/css/frontend-v1.css
 *   ../../public/static/media/*            (images referenced by the JS/CSS)
 *
 * Uses Create React App's own webpack config, with fixed filenames, a single chunk, and no
 * index.html / asset-manifest. Only the files above (and the media folder) are written or replaced;
 * everything else in public/static (e.g. js/nouislider.min.js) is left alone.
 */
process.env.NODE_ENV = "production";
process.env.BABEL_ENV = "production";

process.on("unhandledRejection", (err) => {
  throw err;
});

require("react-scripts/config/env");

const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const configFactory = require("react-scripts/config/webpack.config");

const outDir = path.resolve(__dirname, "../../../public/static");
const mediaDir = path.join(outDir, "media");

const config = configFactory("production");

config.output.path = outDir;
config.output.filename = "js/frontend-v1.js";
config.output.chunkFilename = "js/frontend-v1.[name].js";
config.output.assetModuleFilename = "media/[name].[hash][ext]";
config.output.clean = false;
config.optimization.splitChunks = false;
config.optimization.runtimeChunk = false;

config.plugins = config.plugins.filter((plugin) => {
  const name = plugin.constructor && plugin.constructor.name;
  // Not needed on WordPress: HTML shell, manifest, inline-runtime helper.
  return !["HtmlWebpackPlugin", "InterpolateHtmlPlugin", "InlineChunkHtmlPlugin", "WebpackManifestPlugin"].includes(name);
});
config.plugins.forEach((plugin) => {
  if (plugin instanceof MiniCssExtractPlugin) {
    plugin.options.filename = "css/frontend-v1.css";
    plugin.options.chunkFilename = "css/frontend-v1.[name].css";
  }
});

// CSS lives in css/, images in media/: url()s must be relative to the stylesheet.
const setCssPublicPath = (rules) => {
  (rules || []).forEach((rule) => {
    if (rule.oneOf) setCssPublicPath(rule.oneOf);
    (Array.isArray(rule.use) ? rule.use : []).forEach((use) => {
      if (use && use.loader === MiniCssExtractPlugin.loader) {
        use.options = { ...(use.options || {}), publicPath: "../" };
      }
    });
  });
};
setCssPublicPath(config.module.rules);

// JS asset URLs files in media/ with the file-name-based loaders (svg/file-loader) too.
const setFileLoaderNames = (rules) => {
  (rules || []).forEach((rule) => {
    if (rule.oneOf) setFileLoaderNames(rule.oneOf);
    (Array.isArray(rule.use) ? rule.use : []).forEach((use) => {
      if (use && typeof use.loader === "string" && use.loader.includes("file-loader")) {
        use.options = { ...(use.options || {}), name: "media/[name].[hash].[ext]" };
      }
    });
  });
};
setFileLoaderNames(config.module.rules);

// noUiSlider 14 throws when a facet has a single value (range min === max). Coerce to min + step
// so a one-option filter cannot crash the storefront.
class NoUiSliderEqualRangePlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap("NoUiSliderEqualRangePlugin", (compilation) => {
      compilation.hooks.processAssets.tap(
        { name: "NoUiSliderEqualRangePlugin", stage: webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE },
        (assets) => {
          const file = "js/frontend-v1.js";
          if (!assets[file]) return;
          const re = /if\((\w+)\.min===\1\.max\)throw new Error\([^;]*cannot be equal[^;]*;/;
          const src = assets[file].source().toString();
          if (!re.test(src)) return;
          const next = src.replace(
            re,
            'if($1.min===$1.max){var __gfStep=(typeof t!=="undefined"&&t&&t.singleStep&&t.singleStep>0)?Number(t.singleStep):1;if(!isFinite(__gfStep)||__gfStep<=0)__gfStep=1;$1=Object.assign({},$1,{max:Number($1.min)+__gfStep});}'
          );
          compilation.updateAsset(file, new webpack.sources.RawSource(next));
        }
      );
    });
  }
}
config.plugins.push(new NoUiSliderEqualRangePlugin());

// Media file names are hashed; drop the previous build's images so they never accumulate.
fs.rmSync(mediaDir, { recursive: true, force: true });

webpack(config, (err, stats) => {
  if (err) {
    console.error(err.stack || err);
    process.exit(1);
  }
  const info = stats.toJson({ all: false, errors: true, warnings: true, assets: true });
  if (stats.hasErrors()) {
    info.errors.forEach((e) => console.error(e.message || e));
    process.exit(1);
  }

  const js = path.join(outDir, "js", "frontend-v1.js");
  const extraChunks = fs.readdirSync(path.join(outDir, "js")).filter((f) => /^frontend-v1\..+\.js$/.test(f) && !f.endsWith(".LICENSE.txt"));
  if (extraChunks.length) {
    console.error(`Unexpected extra chunks (WordPress enqueues a single file): ${extraChunks.join(", ")}`);
    process.exit(1);
  }
  if (fs.readFileSync(js, "utf8").includes("cannot be equal")) {
    console.error("noUiSlider equal-range throw is still present in frontend-v1.js");
    process.exit(1);
  }

  const kb = (f) => `${(fs.statSync(f).size / 1024).toFixed(1)} KB`;
  console.log("Built into public/static/:");
  console.log(`  js/frontend-v1.js   ${kb(js)}`);
  console.log(`  css/frontend-v1.css ${kb(path.join(outDir, "css", "frontend-v1.css"))}`);
  console.log(`  media/              ${fs.existsSync(mediaDir) ? fs.readdirSync(mediaDir).length : 0} files`);
});
