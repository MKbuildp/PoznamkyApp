const { withMainApplication } = require('@expo/config-plugins');

/**
 * Config plugin pro edgeToEdgeEnabled
 * Přidá WindowCompat.setDecorFitsSystemWindows do MainApplication
 */
const withEdgeToEdge = (config) => {
  // Upravíme MainApplication po prebuildu
  config = withMainApplication(config, (config) => {
    let mainApplication = config.modResults.contents;

    // Zkontrolujeme, jestli už není WindowCompat přidán
    if (mainApplication.includes('WindowCompat')) {
      return config;
    }

    // Přidáme import
    if (!mainApplication.includes('import androidx.core.view.WindowCompat;')) {
      mainApplication = mainApplication.replace(
        /(import android\.os\.Bundle;)/,
        '$1\nimport androidx.core.view.WindowCompat;'
      );
    }

    // Přidáme volání v onCreate
    if (!mainApplication.includes('WindowCompat.setDecorFitsSystemWindows')) {
      mainApplication = mainApplication.replace(
        /(super\.onCreate\(\);)/,
        '$1\n    WindowCompat.setDecorFitsSystemWindows(getWindow(), false);'
      );
    }

    config.modResults.contents = mainApplication;
    return config;
  });

  return config;
};

module.exports = withEdgeToEdge;

