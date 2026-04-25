const { withAppBuildGradle, withProjectBuildGradle, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo Config Plugin để tự động cấu hình Signing Key và Kotlin Version cho Android
 */
const withAndroidNativeConfig = (config) => {
  // 1. Cấu hình signingConfigs trong android/app/build.gradle
  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      config.modResults.contents = addSigningConfig(config.modResults.contents);
    }
    return config;
  });

  // 2. Cấu hình Kotlin Version trong android/build.gradle (file gốc)
  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      config.modResults.contents = addKotlinConfig(config.modResults.contents);
    }
    return config;
  });

  // 3. Copy file keystore từ thư mục gốc vào android/app
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const keystoreFilename = '@tranhiepgold__soitoadovn.jks';
      const srcPath = path.join(projectRoot, keystoreFilename);
      const destPath = path.join(projectRoot, 'android', 'app', keystoreFilename);

      if (fs.existsSync(srcPath)) {
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        fs.copyFileSync(srcPath, destPath);
        console.log(`✅ Copped keystore to ${destPath}`);
      }
      return config;
    },
  ]);

  return config;
};

/**
 * Thêm cấu hình Kotlin vào root build.gradle
 */
function addKotlinConfig(content) {
  const kotlinBlock = `
buildscript {
    ext {
        kotlinVersion = "2.1.20"
    }
    dependencies {
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion"
    }
}
`;

  if (!content.includes('kotlinVersion =')) {
    return kotlinBlock + content;
  }
  
  return content;
}

/**
 * Logic chỉnh sửa nội dung app/build.gradle
 */
function addSigningConfig(content) {
  const keystoreName = '@tranhiepgold__soitoadovn.jks';
  const storePassword = '90837e91a8d492e26431fc818455eaa6';
  const keyAlias = '53d2a70dd05481779f39dedcfd044365';
  const keyPassword = 'e7665b62732632d06c5e5094657467fa';

  const releaseSigningBlock = `
        release {
            storeFile file('${keystoreName}')
            storePassword '${storePassword}'
            keyAlias '${keyAlias}'
            keyPassword '${keyPassword}'
        }`;

  // 1. Thêm cấu hình release vào signingConfigs nếu chưa có
  if (!content.includes(`storeFile file('${keystoreName}')` || !content.includes('release {'))) {
    // Tìm vị trí sau khối debug { ... } trong signingConfigs
    content = content.replace(
      /(signingConfigs\s*\{[\s\S]*?debug\s*\{[\s\S]*?\}\s*)/,
      `$1${releaseSigningBlock}\n`
    );
  }

  // 2. Ép buộc thay thế signingConfig trong buildTypes -> release
  // Chúng ta dùng một hàm xử lý để chỉ thay thế trong phần sau từ khóa "release {" của "buildTypes"
  const buildTypesIndex = content.indexOf('buildTypes {');
  if (buildTypesIndex !== -1) {
    let buildTypesContent = content.substring(buildTypesIndex);
    
    // Tìm vị trí bắt đầu của release block trong buildTypes
    const releaseMatch = buildTypesContent.match(/release\s*\{/);
    if (releaseMatch) {
      const releaseStartIndex = releaseMatch.index;
      let releaseContent = buildTypesContent.substring(releaseStartIndex);
      
      // Chỉ thay thế occurrence đầu tiên của signingConfigs.debug bên trong khối release này
      if (releaseContent.includes('signingConfig signingConfigs.debug')) {
        releaseContent = releaseContent.replace(
          'signingConfig signingConfigs.debug',
          'signingConfig signingConfigs.release'
        );
        
        // Gộp lại chuỗi
        buildTypesContent = buildTypesContent.substring(0, releaseStartIndex) + releaseContent;
        content = content.substring(0, buildTypesIndex) + buildTypesContent;
      }
    }
  }

  return content;
}

module.exports = withAndroidNativeConfig;
