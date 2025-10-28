const { withAndroidManifest } = require('@expo/config-plugins');

const withUsageStats = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;

    if (!androidManifest['uses-permission']) {
      androidManifest['uses-permission'] = [];
    }

    const hasPermission = androidManifest['uses-permission'].some(
      (perm) => perm.$['android:name'] === 'android.permission.PACKAGE_USAGE_STATS'
    );

    if (!hasPermission) {
      androidManifest['uses-permission'].push({
        $: {
          'android:name': 'android.permission.PACKAGE_USAGE_STATS',
          'tools:ignore': 'ProtectedPermissions',
        },
      });
    }

    return config;
  });
};

module.exports = withUsageStats;
