// elvchange_shaders.js
// maff_elvchange3.html 用のシェーダー・凡例・標高計算関数
// maff_elvchange2.html から分離

// -70～+70m対応のカラーマップ用シェーダー
// 青→白→赤 のダイバージングカラーマップ
// 西岡他（2015）の標高計算ルールに基づく
var colorMapShader = `
precision mediump float;
uniform sampler2D image;
uniform vec2 unit;
uniform float zoom;

// 西岡他（2015）に基づく標高値計算関数
float calculateAltitude(vec3 rgb) {
  float x = rgb.r * 16711680.0 + rgb.g * 65280.0 + rgb.b * 255.0;
  float u = 0.01; // 標高分解能

  if (x < 8388608.0) {
    return x * u;
  } else if (abs(x - 8388608.0) < 1.0) {
    return -9999.0; // NA値
  } else if (x > 8388608.0) {
    return (x - 16777216.0) * u;
  } else {
    return -9999.0; // 無効な値
  }
}


// -70～+70m対応のカラーマップ（青→白→赤）
vec3 getColor(float altitude) {
  if (altitude < -10.0) {
    // -70～-10m:5m毎（12段階）濃青～淡青のグラデーション
    int level = int((altitude + 70.0) / 5.0);
    if (level == 0) return vec3(0.00, 0.20, 0.85);   // -70～-65m: 濃青
    if (level == 1) return vec3(0.05, 0.24, 0.86);   // -65～-60m: 濃青
    if (level == 2) return vec3(0.10, 0.28, 0.86);   // -60～-55m: 青
    if (level == 3) return vec3(0.14, 0.31, 0.87);   // -55～-50m: 青
    if (level == 4) return vec3(0.19, 0.35, 0.88);   // -50～-45m: 青
    if (level == 5) return vec3(0.24, 0.39, 0.89);   // -45～-40m: 青
    if (level == 6) return vec3(0.29, 0.43, 0.89);   // -40～-35m: 淡青
    if (level == 7) return vec3(0.33, 0.47, 0.90);   // -35～-30m: 淡青
    if (level == 8) return vec3(0.38, 0.50, 0.91);   // -30～-25m: 淡青
    if (level == 9) return vec3(0.43, 0.54, 0.91);   // -25～-20m: 淡青
    if (level == 10) return vec3(0.48, 0.58, 0.92);  // -20～-15m: 薄青
    if (level == 11) return vec3(0.52, 0.62, 0.93);  // -15～-10m: 薄青
  } else if (altitude <= 0.0) {
    // -10～0m:1m毎（10段階）薄青～白のグラデーション
    int level = int(altitude);
    if (level <= -10) return vec3(0.57, 0.66, 0.94);  // -10以下
    if (level == -9) return vec3(0.62, 0.70, 0.94);   // -9～-8m
    if (level == -8) return vec3(0.67, 0.73, 0.95);   // -8～-7m
    if (level == -7) return vec3(0.71, 0.77, 0.96);   // -7～-6m
    if (level == -6) return vec3(0.76, 0.81, 0.96);   // -6～-5m
    if (level == -5) return vec3(0.81, 0.85, 0.97);   // -5～-4m
    if (level == -4) return vec3(0.86, 0.89, 0.98);   // -4～-3m
    if (level == -3) return vec3(0.90, 0.92, 0.99);   // -3～-2m
    if (level == -2) return vec3(0.95, 0.96, 0.99);   // -2～-1m
    return vec3(1.00, 1.00, 1.00);                    // -1～0m: 白
  } else if (altitude < 10.0) {
    // 0～10m:1m毎（10段階）白～淡赤のグラデーション
    int level = int(altitude);
    if (level == 0) return vec3(0.99, 0.96, 0.96);   // 0-1m: ほぼ白
    if (level == 1) return vec3(0.98, 0.92, 0.92);   // 1-2m: 極薄赤
    if (level == 2) return vec3(0.97, 0.88, 0.88);   // 2-3m: 極薄赤
    if (level == 3) return vec3(0.96, 0.83, 0.83);   // 3-4m: 薄赤
    if (level == 4) return vec3(0.95, 0.79, 0.79);   // 4-5m: 薄赤
    if (level == 5) return vec3(0.94, 0.75, 0.75);   // 5-6m: 淡赤
    if (level == 6) return vec3(0.93, 0.71, 0.71);   // 6-7m: 淡赤
    if (level == 7) return vec3(0.92, 0.67, 0.67);   // 7-8m: 淡赤
    if (level == 8) return vec3(0.91, 0.63, 0.63);   // 8-9m: 赤
    if (level == 9) return vec3(0.90, 0.58, 0.58);   // 9-10m: 赤
  } else {
    // 10m以上は5m毎（14段階）赤～濃赤のグラデーション
    int level = int((altitude - 10.0) / 5.0);
    if (level == 0) return vec3(0.89, 0.54, 0.54);    // 10-15m: 赤
    if (level == 1) return vec3(0.88, 0.50, 0.50);    // 15-20m: 赤
    if (level == 2) return vec3(0.86, 0.46, 0.46);    // 20-25m: 赤
    if (level == 3) return vec3(0.85, 0.42, 0.42);    // 25-30m: 濃赤
    if (level == 4) return vec3(0.84, 0.38, 0.38);    // 30-35m: 濃赤
    if (level == 5) return vec3(0.83, 0.33, 0.33);    // 35-40m: 濃赤
    if (level == 6) return vec3(0.82, 0.29, 0.29);    // 40-45m: 暗赤
    if (level == 7) return vec3(0.81, 0.25, 0.25);    // 45-50m: 暗赤
    if (level == 8) return vec3(0.80, 0.21, 0.21);    // 50-55m: 暗赤
    if (level == 9) return vec3(0.79, 0.17, 0.17);    // 55-60m: 暗赤
    if (level == 10) return vec3(0.78, 0.13, 0.13);   // 60-65m: 最暗赤
    if (level == 11) return vec3(0.77, 0.08, 0.08);   // 65-70m: 最暗赤
    if (level == 12) return vec3(0.76, 0.04, 0.04);   // 70-75m: 最暗赤
    return vec3(0.75, 0.00, 0.00);                    // 75m以上: 最濃赤
  }
  return vec3(0.5, 0.5, 0.5);
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, 1.0 / unit.y - gl_FragCoord.y);

  // 標高値を計算
  vec4 pixelColor = texture2D(image, p * unit);
  float alt = calculateAltitude(pixelColor.rgb);

  // NA値（-9999）の場合は透明
  if (alt < -9998.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    return;
  }

  // 色を取得
  vec3 color = getColor(alt);

  // 無効なデータは透明化
  float alpha = (alt >= -70.0 && alt <= 75.0) ? 1.0 : 0.0;

  gl_FragColor = vec4(color, alpha);
}
`;

// 等高線表示用シェーダー（現在未使用だが保持）
var contourShader = `
precision mediump float;
uniform sampler2D image;
uniform vec2 unit;
uniform float zoom;

// 西岡他（2015）に基づく標高値計算関数
float calculateAltitude(vec3 rgb) {
  float x = rgb.r * 16711680.0 + rgb.g * 65280.0 + rgb.b * 255.0;
  float u = 0.01; // 標高分解能

  if (x < 8388608.0) {
    return x * u;
  } else if (abs(x - 8388608.0) < 1.0) {
    return -9999.0; // NA値
  } else if (x > 8388608.0) {
    return (x - 16777216.0) * u;
  } else {
    return -9999.0; // 無効な値
  }
}

int getLevel(float altitude) {
  if (altitude < -10.0) {
    return int((altitude + 70.0) / 5.0);
  } else if (altitude < 10.0) {
    return 12 + int(altitude);
  } else {
    return 22 + int((altitude - 10.0) / 5.0);
  }
}

vec3 getColor(float altitude) {
  if (altitude < -10.0) {
    int level = int((altitude + 70.0) / 5.0);
    if (level == 0) return vec3(0.00, 0.20, 0.85);
    if (level == 1) return vec3(0.05, 0.24, 0.86);
    if (level == 2) return vec3(0.10, 0.28, 0.86);
    if (level == 3) return vec3(0.14, 0.31, 0.87);
    if (level == 4) return vec3(0.19, 0.35, 0.88);
    if (level == 5) return vec3(0.24, 0.39, 0.89);
    if (level == 6) return vec3(0.29, 0.43, 0.89);
    if (level == 7) return vec3(0.33, 0.47, 0.90);
    if (level == 8) return vec3(0.38, 0.50, 0.91);
    if (level == 9) return vec3(0.43, 0.54, 0.91);
    if (level == 10) return vec3(0.48, 0.58, 0.92);
    if (level == 11) return vec3(0.52, 0.62, 0.93);
  } else if (altitude <= 0.0) {
    int level = int(altitude);
    if (level <= -10) return vec3(0.57, 0.66, 0.94);
    if (level == -9) return vec3(0.62, 0.70, 0.94);
    if (level == -8) return vec3(0.67, 0.73, 0.95);
    if (level == -7) return vec3(0.71, 0.77, 0.96);
    if (level == -6) return vec3(0.76, 0.81, 0.96);
    if (level == -5) return vec3(0.81, 0.85, 0.97);
    if (level == -4) return vec3(0.86, 0.89, 0.98);
    if (level == -3) return vec3(0.90, 0.92, 0.99);
    if (level == -2) return vec3(0.95, 0.96, 0.99);
    return vec3(1.00, 1.00, 1.00);
  } else if (altitude < 10.0) {
    int level = int(altitude);
    if (level == 0) return vec3(0.99, 0.96, 0.96);
    if (level == 1) return vec3(0.98, 0.92, 0.92);
    if (level == 2) return vec3(0.97, 0.88, 0.88);
    if (level == 3) return vec3(0.96, 0.83, 0.83);
    if (level == 4) return vec3(0.95, 0.79, 0.79);
    if (level == 5) return vec3(0.94, 0.75, 0.75);
    if (level == 6) return vec3(0.93, 0.71, 0.71);
    if (level == 7) return vec3(0.92, 0.67, 0.67);
    if (level == 8) return vec3(0.91, 0.63, 0.63);
    if (level == 9) return vec3(0.90, 0.58, 0.58);
  } else {
    int level = int((altitude - 10.0) / 5.0);
    if (level == 0) return vec3(0.89, 0.54, 0.54);
    if (level == 1) return vec3(0.88, 0.50, 0.50);
    if (level == 2) return vec3(0.86, 0.46, 0.46);
    if (level == 3) return vec3(0.85, 0.42, 0.42);
    if (level == 4) return vec3(0.84, 0.38, 0.38);
    if (level == 5) return vec3(0.83, 0.33, 0.33);
    if (level == 6) return vec3(0.82, 0.29, 0.29);
    if (level == 7) return vec3(0.81, 0.25, 0.25);
    if (level == 8) return vec3(0.80, 0.21, 0.21);
    if (level == 9) return vec3(0.79, 0.17, 0.17);
    if (level == 10) return vec3(0.78, 0.13, 0.13);
    if (level == 11) return vec3(0.77, 0.08, 0.08);
    if (level == 12) return vec3(0.76, 0.04, 0.04);
    return vec3(0.75, 0.00, 0.00);
  }
  return vec3(0.5, 0.5, 0.5);
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, 1.0 / unit.y - gl_FragCoord.y);

  // 標高値を計算（複数ポイント）
  vec4 c1 = texture2D(image, (p + vec2(0.0, 0.0)) * unit);
  vec4 c2 = texture2D(image, (p + vec2(1.0, 0.0)) * unit);
  vec4 c3 = texture2D(image, (p + vec2(0.0, 1.0)) * unit);
  vec4 c4 = texture2D(image, (p + vec2(1.0, 1.0)) * unit);

  float h1 = calculateAltitude(c1.rgb);
  float h2 = calculateAltitude(c2.rgb);
  float h3 = calculateAltitude(c3.rgb);
  float h4 = calculateAltitude(c4.rgb);

  // レベルを計算
  int level1 = getLevel(h1);
  int level2 = getLevel(h2);
  int level3 = getLevel(h3);
  int level4 = getLevel(h4);

  vec3 baseColor = getColor(h1);

  // 等高線の描画（境界を黒くする）
  float contourAlpha = (level1 != level2 || level1 != level3 || level1 != level4) ? 0.5 : 0.3;

  gl_FragColor = vec4(baseColor, contourAlpha);
}
`;

// 凡例カラーラベル配列
var legendLabels = [
  ['-70～-65m', 'rgb(0, 51, 217)'],
  ['-65～-60m', 'rgb(13, 61, 219)'],
  ['-60～-55m', 'rgb(26, 71, 219)'],
  ['-55～-50m', 'rgb(36, 79, 222)'],
  ['-50～-45m', 'rgb(48, 89, 224)'],
  ['-45～-40m', 'rgb(61, 99, 227)'],
  ['-40～-35m', 'rgb(74, 110, 227)'],
  ['-35～-30m', 'rgb(84, 120, 230)'],
  ['-30～-25m', 'rgb(97, 128, 232)'],
  ['-25～-20m', 'rgb(110, 138, 232)'],
  ['-20～-15m', 'rgb(122, 148, 235)'],
  ['-15～-10m', 'rgb(133, 158, 237)'],
  ['-10～-9m', 'rgb(145, 168, 240)'],
  ['-9～-8m', 'rgb(158, 179, 240)'],
  ['-8～-7m', 'rgb(171, 186, 242)'],
  ['-7～-6m', 'rgb(181, 196, 245)'],
  ['-6～-5m', 'rgb(194, 207, 245)'],
  ['-5～-4m', 'rgb(207, 217, 247)'],
  ['-4～-3m', 'rgb(219, 227, 250)'],
  ['-3～-2m', 'rgb(230, 235, 252)'],
  ['-2～-1m', 'rgb(242, 245, 252)'],
  ['-1～0m', 'rgb(255, 255, 255)'],
  ['0-1m', 'rgb(252, 245, 245)'],
  ['1-2m', 'rgb(250, 235, 235)'],
  ['2-3m', 'rgb(247, 224, 224)'],
  ['3-4m', 'rgb(245, 212, 212)'],
  ['4-5m', 'rgb(242, 201, 201)'],
  ['5-6m', 'rgb(240, 191, 191)'],
  ['6-7m', 'rgb(237, 181, 181)'],
  ['7-8m', 'rgb(235, 171, 171)'],
  ['8-9m', 'rgb(232, 161, 161)'],
  ['9-10m', 'rgb(230, 148, 148)'],
  ['10-15m', 'rgb(227, 138, 138)'],
  ['15-20m', 'rgb(224, 128, 128)'],
  ['20-25m', 'rgb(219, 117, 117)'],
  ['25-30m', 'rgb(217, 107, 107)'],
  ['30-35m', 'rgb(214, 97, 97)'],
  ['35-40m', 'rgb(212, 84, 84)'],
  ['40-45m', 'rgb(209, 74, 74)'],
  ['45-50m', 'rgb(207, 64, 64)'],
  ['50-55m', 'rgb(204, 54, 54)'],
  ['55-60m', 'rgb(201, 43, 43)'],
  ['60-65m', 'rgb(199, 33, 33)'],
  ['65-70m', 'rgb(196, 20, 20)'],
  ['70m以上', 'rgb(191, 0, 0)']
];

// クリック時の標高計算関数（JavaScript版）
function calculateAltitudeJS(r, g, b) {
  var x = r * 16711680.0 + g * 65280.0 + b * 255.0;
  var u = 0.01;

  if (x < 8388608.0) {
    return x * u;
  } else if (x === 8388608.0) {
    return -9999.0;
  } else {
    return (x - 16777216.0) * u;
  }
}
