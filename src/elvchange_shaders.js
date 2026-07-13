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


// -70～+75m対応のカラーマップ（青→緑→黄→橙→赤の5色を通しでランク付けした配色）
// 0m（変化なし）を黄色にし、負側は青→緑→黄、正側は黄→橙→赤と多くの色相を経由させることで、
// 分位点で細分化された0m付近のクラス同士も見分けやすいコントラストを持たせている。
// 区分の境界（分位点）は実タイルデータのヒストグラムに基づく「ヒストグラム平坦化」で、
// 変化量が集中する±1m以内を重点的に細分化し、それ以外は5m/1m刻みとした。
vec3 getColor(float altitude) {
  if (altitude <= 0.0) {
    if (altitude < -65.000) return vec3(0.078, 0.196, 0.745);  // -70～-65m
    if (altitude < -60.000) return vec3(0.082, 0.227, 0.714);  // -65～-60m
    if (altitude < -55.000) return vec3(0.082, 0.255, 0.678);  // -60～-55m
    if (altitude < -50.000) return vec3(0.086, 0.286, 0.647);  // -55～-50m
    if (altitude < -45.000) return vec3(0.090, 0.314, 0.616);  // -50～-45m
    if (altitude < -40.000) return vec3(0.090, 0.345, 0.584);  // -45～-40m
    if (altitude < -35.000) return vec3(0.094, 0.376, 0.549);  // -40～-35m
    if (altitude < -30.000) return vec3(0.098, 0.404, 0.518);  // -35～-30m
    if (altitude < -25.000) return vec3(0.102, 0.435, 0.486);  // -30～-25m
    if (altitude < -20.000) return vec3(0.102, 0.463, 0.455);  // -25～-20m
    if (altitude < -15.000) return vec3(0.106, 0.494, 0.420);  // -20～-15m
    if (altitude < -10.000) return vec3(0.110, 0.522, 0.388);  // -15～-10m
    if (altitude < -9.000) return vec3(0.110, 0.553, 0.357);   // -10～-9m
    if (altitude < -8.000) return vec3(0.114, 0.584, 0.322);   // -9～-8m
    if (altitude < -7.000) return vec3(0.118, 0.612, 0.290);   // -8～-7m
    if (altitude < -6.000) return vec3(0.149, 0.635, 0.271);   // -7～-6m
    if (altitude < -5.000) return vec3(0.208, 0.651, 0.259);   // -6～-5m
    if (altitude < -4.000) return vec3(0.267, 0.667, 0.247);   // -5～-4m
    if (altitude < -3.000) return vec3(0.325, 0.682, 0.235);   // -4～-3m
    if (altitude < -2.000) return vec3(0.384, 0.702, 0.227);   // -3～-2m
    if (altitude < -1.000) return vec3(0.443, 0.718, 0.216);   // -2～-1m
    // -1m～0m: 実タイルデータのヒストグラムから分位点で細分化（変化量の99%が集中する帯）
    if (altitude < -0.290) return vec3(0.506, 0.733, 0.204);   // -1～-0.29m
    if (altitude < -0.180) return vec3(0.565, 0.749, 0.192);   // -0.29～-0.18m
    if (altitude < -0.130) return vec3(0.624, 0.765, 0.184);   // -0.18～-0.13m
    if (altitude < -0.090) return vec3(0.682, 0.780, 0.173);   // -0.13～-0.09m
    if (altitude < -0.060) return vec3(0.741, 0.796, 0.161);   // -0.09～-0.06m
    if (altitude < -0.040) return vec3(0.800, 0.816, 0.149);   // -0.06～-0.04m
    if (altitude < -0.020) return vec3(0.863, 0.831, 0.141);   // -0.04～-0.02m
    if (altitude < -0.010) return vec3(0.922, 0.847, 0.129);   // -0.02～-0.01m
    return vec3(0.980, 0.863, 0.118);                          // -0.01～0m: 黄
  } else {
    // 0m～1m: 実タイルデータのヒストグラムから分位点で細分化（変化量の99%が集中する帯）
    if (altitude < 0.020) return vec3(0.980, 0.863, 0.118);   // 0～0.02m: 黄
    if (altitude < 0.030) return vec3(0.976, 0.843, 0.114);   // 0.02～0.03m
    if (altitude < 0.050) return vec3(0.973, 0.824, 0.114);   // 0.03～0.05m
    if (altitude < 0.070) return vec3(0.969, 0.804, 0.110);   // 0.05～0.07m
    if (altitude < 0.130) return vec3(0.965, 0.780, 0.106);   // 0.07～0.13m
    if (altitude < 0.180) return vec3(0.961, 0.761, 0.106);   // 0.13～0.18m
    if (altitude < 0.230) return vec3(0.957, 0.741, 0.102);   // 0.18～0.23m
    if (altitude < 0.310) return vec3(0.953, 0.722, 0.098);   // 0.23～0.31m
    if (altitude < 0.440) return vec3(0.949, 0.702, 0.098);   // 0.31～0.44m
    if (altitude < 1.000) return vec3(0.945, 0.682, 0.094);   // 0.44～1m
    if (altitude < 2.000) return vec3(0.941, 0.659, 0.094);   // 1～2m
    if (altitude < 3.000) return vec3(0.937, 0.639, 0.090);   // 2～3m
    if (altitude < 4.000) return vec3(0.933, 0.620, 0.086);   // 3～4m
    if (altitude < 5.000) return vec3(0.929, 0.600, 0.086);   // 4～5m
    if (altitude < 6.000) return vec3(0.925, 0.580, 0.082);   // 5～6m
    if (altitude < 7.000) return vec3(0.922, 0.561, 0.078);   // 6～7m
    if (altitude < 8.000) return vec3(0.918, 0.533, 0.078);   // 7～8m
    if (altitude < 9.000) return vec3(0.910, 0.506, 0.082);   // 8～9m
    if (altitude < 10.000) return vec3(0.898, 0.478, 0.086);  // 9～10m
    if (altitude < 15.000) return vec3(0.890, 0.451, 0.086);  // 10～15m
    if (altitude < 20.000) return vec3(0.882, 0.424, 0.090);  // 15～20m
    if (altitude < 25.000) return vec3(0.875, 0.396, 0.094);  // 20～25m
    if (altitude < 30.000) return vec3(0.863, 0.369, 0.094);  // 25～30m
    if (altitude < 35.000) return vec3(0.855, 0.341, 0.098);  // 30～35m
    if (altitude < 40.000) return vec3(0.847, 0.314, 0.098);  // 35～40m
    if (altitude < 45.000) return vec3(0.839, 0.286, 0.102);  // 40～45m
    if (altitude < 50.000) return vec3(0.827, 0.255, 0.106);  // 45～50m
    if (altitude < 55.000) return vec3(0.820, 0.227, 0.106);  // 50～55m
    if (altitude < 60.000) return vec3(0.812, 0.200, 0.110);  // 55～60m
    if (altitude < 65.000) return vec3(0.804, 0.173, 0.114);  // 60～65m
    if (altitude < 70.000) return vec3(0.792, 0.145, 0.114);  // 65～70m
    return vec3(0.784, 0.118, 0.118);                         // 70～75m
  }
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

// 凡例カラーラベル配列（青→緑→黄→橙→赤、0m=黄を中心としたランク付け配色）
var legendLabels = [
  ['-70～-65m', 'rgb(20, 50, 190)'],
  ['-65～-60m', 'rgb(21, 58, 182)'],
  ['-60～-55m', 'rgb(21, 65, 173)'],
  ['-55～-50m', 'rgb(22, 73, 165)'],
  ['-50～-45m', 'rgb(23, 80, 157)'],
  ['-45～-40m', 'rgb(23, 88, 149)'],
  ['-40～-35m', 'rgb(24, 96, 140)'],
  ['-35～-30m', 'rgb(25, 103, 132)'],
  ['-30～-25m', 'rgb(26, 111, 124)'],
  ['-25～-20m', 'rgb(26, 118, 116)'],
  ['-20～-15m', 'rgb(27, 126, 107)'],
  ['-15～-10m', 'rgb(28, 133, 99)'],
  ['-10～-9m', 'rgb(28, 141, 91)'],
  ['-9～-8m', 'rgb(29, 149, 82)'],
  ['-8～-7m', 'rgb(30, 156, 74)'],
  ['-7～-6m', 'rgb(38, 162, 69)'],
  ['-6～-5m', 'rgb(53, 166, 66)'],
  ['-5～-4m', 'rgb(68, 170, 63)'],
  ['-4～-3m', 'rgb(83, 174, 60)'],
  ['-3～-2m', 'rgb(98, 179, 58)'],
  ['-2～-1m', 'rgb(113, 183, 55)'],
  ['-1～-0.29m', 'rgb(129, 187, 52)'],
  ['-0.29～-0.18m', 'rgb(144, 191, 49)'],
  ['-0.18～-0.13m', 'rgb(159, 195, 47)'],
  ['-0.13～-0.09m', 'rgb(174, 199, 44)'],
  ['-0.09～-0.06m', 'rgb(189, 203, 41)'],
  ['-0.06～-0.04m', 'rgb(204, 208, 38)'],
  ['-0.04～-0.02m', 'rgb(220, 212, 36)'],
  ['-0.02～-0.01m', 'rgb(235, 216, 33)'],
  ['-0.01～0m', 'rgb(250, 220, 30)'],
  ['0～0.02m', 'rgb(250, 220, 30)'],
  ['0.02～0.03m', 'rgb(249, 215, 29)'],
  ['0.03～0.05m', 'rgb(248, 210, 29)'],
  ['0.05～0.07m', 'rgb(247, 205, 28)'],
  ['0.07～0.13m', 'rgb(246, 199, 27)'],
  ['0.13～0.18m', 'rgb(245, 194, 27)'],
  ['0.18～0.23m', 'rgb(244, 189, 26)'],
  ['0.23～0.31m', 'rgb(243, 184, 25)'],
  ['0.31～0.44m', 'rgb(242, 179, 25)'],
  ['0.44～1m', 'rgb(241, 174, 24)'],
  ['1～2m', 'rgb(240, 168, 24)'],
  ['2～3m', 'rgb(239, 163, 23)'],
  ['3～4m', 'rgb(238, 158, 22)'],
  ['4～5m', 'rgb(237, 153, 22)'],
  ['5～6m', 'rgb(236, 148, 21)'],
  ['6～7m', 'rgb(235, 143, 20)'],
  ['7～8m', 'rgb(234, 136, 20)'],
  ['8～9m', 'rgb(232, 129, 21)'],
  ['9～10m', 'rgb(229, 122, 22)'],
  ['10～15m', 'rgb(227, 115, 22)'],
  ['15～20m', 'rgb(225, 108, 23)'],
  ['20～25m', 'rgb(223, 101, 24)'],
  ['25～30m', 'rgb(220, 94, 24)'],
  ['30～35m', 'rgb(218, 87, 25)'],
  ['35～40m', 'rgb(216, 80, 25)'],
  ['40～45m', 'rgb(214, 73, 26)'],
  ['45～50m', 'rgb(211, 65, 27)'],
  ['50～55m', 'rgb(209, 58, 27)'],
  ['55～60m', 'rgb(207, 51, 28)'],
  ['60～65m', 'rgb(205, 44, 29)'],
  ['65～70m', 'rgb(202, 37, 29)'],
  ['70～75m', 'rgb(200, 30, 30)']
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
