const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

exports.default = async function fixCanvas(context) {
  const { appOutDir, electronPlatformName } = context;
  if (electronPlatformName !== 'darwin') {
    return;
  }

  console.log('Fixing node-canvas dependencies for macOS packaging...');

  const appName = context.packager.appInfo.productFilename;
  const canvasNodePath = path.join(
    appOutDir,
    `${appName}.app/Contents/Resources/app.asar.unpacked/node_modules/canvas/build/Release/canvas.node`,
  );

  if (!fs.existsSync(canvasNodePath)) {
    console.error(`Could not find canvas.node at: ${canvasNodePath}`);
    return;
  }

  const libs = [
    '/opt/homebrew/lib/libcairo.2.dylib',
    '/opt/homebrew/lib/libpixman-1.0.dylib',
    '/opt/homebrew/lib/libfontconfig.1.dylib',
    '/opt/homebrew/lib/libfreetype.6.dylib',
    '/opt/homebrew/lib/libpng16.16.dylib',
    '/opt/homebrew/lib/libbrotlidec.1.dylib',
    '/opt/homebrew/lib/libbrotlicommon.1.dylib',
  ];

  const rpath = '@loader_path/../../../../Frameworks';

  try {
    execSync(`install_name_tool -add_rpath "${rpath}" "${canvasNodePath}"`);
    libs.forEach((libPath) => {
      const libName = path.basename(libPath);
      const newPath = `@rpath/${libName}`;
      execSync(
        `install_name_tool -change "${libPath}" "${newPath}" "${canvasNodePath}"`,
      );
    });

    console.log('Successfully patched canvas.node');
  } catch (error) {
    console.error('Failed to patch canvas.node:', error);
    throw error;
  }
}; 