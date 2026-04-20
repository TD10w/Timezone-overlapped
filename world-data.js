// Simplified world continent polygons as [lon, lat] arrays.
// Higher-density hand-curated outlines so continents are readable on an orthographic globe.

window.WORLD_POLYGONS = [

  // ══ AFRICA ════════════════════════════════════════════════════════════════
  [[
    // Start: NW Morocco → south along Atlantic coast
    [-10, 35], [-13, 28], [-17, 23], [-17, 21], [-16, 18], [-16, 16], [-16, 14],
    [-17, 12], [-15, 12], [-13, 12], [-11, 12], [-8, 10], [-8, 7], [-13, 8],
    [-13, 5], [-10, 6], [-8, 5], [-5, 5], [-3, 5], [-1, 5], [2, 6], [3, 6],
    [5, 5], [7, 4], [9, 4], [9, 2], [9, 1], [10, 0], [9, -2], [11, -3], [13, -5],
    [12, -6], [14, -8], [13, -11], [14, -13], [12, -15], [14, -17], [12, -18],
    [14, -22], [16, -23], [15, -27], [18, -29], [18, -32], [18, -34], [20, -35],
    [22, -34], [25, -34], [28, -33], [32, -29], [32, -27], [33, -26], [35, -23],
    [35, -20], [38, -17], [40, -15], [40, -11], [40, -6], [41, -2], [43, 0],
    [43, 4], [46, 5], [48, 8], [51, 11], [51, 12], [49, 12], [45, 11], [44, 13],
    [43, 14], [44, 16], [43, 17], [39, 16], [36, 15], [34, 16], [36, 20], [34, 22],
    [33, 26], [32, 29], [30, 31], [26, 31], [24, 32], [20, 32], [18, 31], [13, 33],
    [10, 34], [7, 34], [3, 36], [1, 36], [-2, 35], [-5, 36], [-8, 36], [-10, 35]
  ]],
  // Madagascar
  [[
    [43, -13], [45, -16], [48, -17], [50, -22], [47, -25], [44, -22], [43, -19], [43, -13]
  ]],

  // ══ EUROPE ════════════════════════════════════════════════════════════════
  // Iberia
  [[
    [-9, 44], [-9, 42], [-9, 38], [-7, 37], [-5, 36], [-2, 36], [0, 38], [3, 41],
    [3, 43], [0, 43], [-2, 43], [-4, 43], [-7, 44], [-9, 44]
  ]],
  // Western + Central Europe + Scandinavia
  [[
    [-5, 48], [-4, 50], [-1, 49], [2, 50], [3, 51], [5, 53], [7, 53], [8, 55],
    [5, 58], [8, 58], [10, 59], [8, 63], [11, 64], [14, 67], [17, 68], [19, 70],
    [23, 70], [26, 70], [28, 71], [31, 70], [33, 69], [30, 66], [32, 63], [29, 60],
    [25, 60], [23, 59], [22, 60], [22, 57], [20, 55], [18, 55], [16, 57], [14, 55],
    [11, 54], [8, 54], [8, 51], [11, 51], [12, 47], [14, 46], [17, 43], [19, 41],
    [20, 39], [23, 40], [26, 41], [28, 41], [28, 43], [30, 45], [33, 45], [35, 45],
    [36, 43], [39, 44], [41, 43], [42, 42], [44, 42], [46, 42], [48, 41], [49, 41],
    [49, 47], [50, 54], [52, 61], [55, 65], [57, 68], [59, 70], [63, 70], [67, 69],
    [66, 66], [56, 64], [51, 61], [46, 55], [42, 49], [38, 48], [36, 46], [33, 46],
    [33, 50], [30, 51], [27, 50], [23, 49], [19, 49], [16, 47], [12, 45], [8, 44],
    [6, 43], [3, 43], [0, 43], [-2, 43], [-4, 45], [-2, 48], [-5, 48]
  ]],
  // UK (Great Britain)
  [[
    [-4, 50], [-3, 51], [0, 51], [1, 52], [1, 53], [0, 54], [-2, 55], [-3, 55],
    [-2, 57], [-4, 58], [-5, 58], [-6, 57], [-5, 55], [-5, 53], [-5, 51], [-4, 50]
  ]],
  // Ireland
  [[
    [-10, 52], [-9, 54], [-8, 55], [-6, 55], [-6, 53], [-7, 52], [-10, 52]
  ]],
  // Iceland
  [[
    [-24, 64], [-20, 63], [-14, 64], [-13, 66], [-15, 67], [-22, 67], [-24, 66], [-24, 64]
  ]],
  // Svalbard (simplified)
  [[
    [11, 77], [20, 77], [22, 80], [18, 81], [12, 80], [10, 79], [11, 77]
  ]],

  // ══ ASIA ══════════════════════════════════════════════════════════════════
  // Main Asia body (Middle East → Siberia → China → SE Asia)
  [[
    [28, 41], [33, 42], [35, 42], [37, 37], [36, 35], [36, 33], [35, 30], [36, 29],
    [38, 28], [40, 25], [43, 22], [44, 18], [43, 16], [46, 15], [50, 17], [54, 17],
    [54, 22], [56, 24], [58, 25], [56, 26], [58, 28], [57, 30], [55, 26], [52, 25],
    [48, 29], [48, 30], [50, 30], [52, 31], [55, 30], [58, 27], [62, 25], [65, 25],
    [68, 24], [70, 20], [73, 15], [75, 10], [77, 8], [78, 8], [80, 13], [83, 17],
    [87, 21], [89, 22], [92, 21], [94, 17], [97, 16], [99, 13], [101, 12], [103, 10],
    [103, 6], [104, 2], [104, 1], [107, 2], [109, 11], [107, 14], [108, 17], [110, 21],
    [112, 21], [117, 23], [120, 23], [121, 25], [121, 30], [122, 31], [122, 36],
    [120, 38], [122, 40], [125, 40], [126, 39], [128, 39], [129, 36], [129, 35],
    [127, 35], [127, 38], [129, 41], [132, 42], [130, 44], [133, 45], [137, 46],
    [140, 45], [141, 47], [142, 50], [145, 52], [146, 55], [150, 59], [155, 59],
    [158, 58], [162, 60], [163, 56], [170, 59], [178, 62], [180, 65], [180, 68],
    [177, 69], [170, 68], [163, 69], [160, 70], [152, 71], [143, 73], [136, 72],
    [129, 73], [121, 73], [113, 74], [110, 76], [105, 78], [100, 79], [92, 77],
    [85, 77], [80, 76], [74, 73], [68, 72], [60, 70], [57, 70], [55, 72], [51, 72],
    [50, 69], [48, 67], [42, 68], [38, 66], [33, 66], [30, 64], [29, 61], [33, 60],
    [33, 55], [32, 52], [34, 50], [35, 46], [36, 45], [34, 42], [31, 41], [28, 41]
  ]],
  // Indian subcontinent tip (Sri Lanka)
  [[
    [80, 6], [82, 7], [82, 9], [80, 10], [79, 7], [80, 6]
  ]],
  // Japan — three big islands
  [[
    [130, 31], [132, 32], [134, 34], [136, 34], [138, 35], [140, 35], [141, 38],
    [142, 40], [141, 42], [140, 41], [137, 37], [134, 35], [132, 34], [130, 33], [130, 31]
  ]],
  [[
    [141, 41], [142, 42], [144, 43], [145, 44], [144, 45], [141, 45], [140, 43], [141, 41]
  ]],
  // Taiwan
  [[
    [120, 22], [122, 23], [122, 25], [121, 25], [120, 24], [120, 22]
  ]],
  // Philippines (simplified big island)
  [[
    [120, 5], [122, 8], [124, 10], [126, 13], [125, 17], [122, 18], [120, 15],
    [119, 11], [120, 5]
  ]],
  // Borneo
  [[
    [109, -4], [115, -4], [118, -2], [119, 2], [117, 5], [113, 6], [110, 5],
    [108, 1], [109, -4]
  ]],
  // Sumatra
  [[
    [95, 5], [98, 4], [102, 0], [104, -2], [105, -5], [103, -6], [99, -3], [95, 1], [95, 5]
  ]],
  // Java
  [[
    [105, -7], [115, -8], [114, -9], [108, -9], [105, -7]
  ]],
  // Sulawesi (rough)
  [[
    [119, -5], [122, -5], [124, -2], [125, 1], [122, 2], [121, -1], [120, -3], [119, -5]
  ]],
  // New Guinea
  [[
    [131, -3], [138, -3], [144, -4], [150, -7], [146, -9], [141, -9], [135, -8], [131, -3]
  ]],

  // ══ AUSTRALIA ═════════════════════════════════════════════════════════════
  [[
    [114, -22], [114, -27], [115, -32], [117, -35], [120, -33], [125, -32],
    [129, -32], [132, -32], [135, -34], [138, -35], [140, -37], [143, -39],
    [147, -39], [150, -37], [152, -32], [153, -29], [153, -25], [149, -22],
    [146, -19], [142, -11], [136, -12], [130, -12], [125, -14], [122, -17],
    [118, -20], [114, -22]
  ]],
  // Tasmania
  [[
    [144, -41], [148, -40], [148, -43], [145, -44], [144, -41]
  ]],
  // New Zealand — North Island
  [[
    [172, -35], [175, -36], [177, -38], [178, -39], [175, -41], [173, -40],
    [173, -37], [172, -35]
  ]],
  // New Zealand — South Island
  [[
    [166, -45], [170, -46], [174, -42], [173, -41], [170, -43], [168, -46], [166, -45]
  ]],

  // ══ NORTH AMERICA ═════════════════════════════════════════════════════════
  [[
    // Alaska → Canada arctic → Greenland side → eastern seaboard → Gulf → west coast
    [-168, 65], [-166, 68], [-156, 71], [-148, 70], [-140, 70], [-135, 69],
    [-128, 70], [-123, 73], [-117, 75], [-110, 77], [-100, 79], [-90, 80],
    [-82, 82], [-74, 80], [-68, 77], [-62, 70], [-65, 67], [-70, 63], [-76, 61],
    [-78, 58], [-80, 53], [-75, 51], [-68, 50], [-60, 50], [-55, 52], [-53, 47],
    [-58, 45], [-64, 45], [-66, 44], [-68, 44], [-70, 43], [-70, 41], [-72, 41],
    [-74, 40], [-75, 38], [-76, 37], [-76, 35], [-77, 34], [-79, 33], [-81, 31],
    [-81, 28], [-80, 25], [-82, 25], [-83, 29], [-85, 30], [-88, 30], [-90, 29],
    [-94, 29], [-97, 26], [-97, 23], [-98, 19], [-96, 16], [-95, 15], [-91, 15],
    [-87, 13], [-83, 9], [-82, 8], [-80, 9], [-78, 8], [-81, 7], [-83, 8],
    [-86, 10], [-89, 16], [-93, 17], [-95, 16], [-97, 15], [-102, 18], [-105, 20],
    [-106, 23], [-110, 23], [-113, 27], [-114, 30], [-117, 32], [-118, 33],
    [-120, 34], [-122, 37], [-123, 38], [-123, 42], [-124, 46], [-124, 48],
    [-126, 50], [-130, 54], [-135, 57], [-140, 59], [-144, 60], [-150, 59],
    [-156, 58], [-162, 60], [-166, 62], [-168, 65]
  ]],
  // Baja California
  [[
    [-115, 23], [-112, 25], [-110, 24], [-109, 23], [-112, 27], [-114, 30],
    [-115, 29], [-115, 26], [-115, 23]
  ]],
  // Greenland
  [[
    [-53, 60], [-43, 60], [-40, 63], [-32, 65], [-24, 71], [-21, 75], [-18, 80],
    [-22, 83], [-38, 83], [-53, 83], [-62, 81], [-63, 77], [-58, 72], [-55, 65],
    [-53, 60]
  ]],
  // Cuba
  [[
    [-85, 22], [-80, 23], [-74, 20], [-75, 19], [-83, 21], [-85, 22]
  ]],
  // Hispaniola
  [[
    [-74, 18], [-68, 19], [-68, 20], [-72, 19], [-74, 19], [-74, 18]
  ]],
  // Newfoundland
  [[
    [-59, 47], [-54, 47], [-53, 50], [-56, 51], [-59, 49], [-59, 47]
  ]],
  // Baffin Island
  [[
    [-80, 63], [-73, 62], [-63, 65], [-62, 70], [-68, 73], [-80, 73], [-85, 70],
    [-83, 65], [-80, 63]
  ]],

  // ══ SOUTH AMERICA ═════════════════════════════════════════════════════════
  [[
    [-81, 12], [-76, 9], [-72, 11], [-66, 10], [-62, 11], [-60, 8], [-55, 6],
    [-52, 5], [-50, 2], [-48, -1], [-44, -2], [-40, -5], [-37, -8], [-35, -9],
    [-38, -13], [-39, -18], [-41, -22], [-44, -23], [-48, -25], [-50, -29],
    [-53, -33], [-57, -35], [-58, -38], [-62, -40], [-65, -42], [-66, -45],
    [-70, -50], [-72, -53], [-73, -55], [-71, -55], [-66, -55], [-63, -53],
    [-67, -50], [-71, -45], [-73, -42], [-73, -38], [-72, -33], [-71, -28],
    [-71, -23], [-70, -18], [-75, -15], [-77, -11], [-79, -8], [-81, -5],
    [-81, -2], [-80, 0], [-79, 2], [-78, 3], [-81, 8], [-81, 12]
  ]],

  // ══ ANTARCTICA (coastline, not polar fill) ════════════════════════════════
  [[
    [-180, -72], [-170, -76], [-160, -78], [-150, -75], [-135, -74], [-120, -74],
    [-105, -74], [-90, -72], [-75, -72], [-62, -75], [-58, -62], [-63, -65],
    [-60, -70], [-45, -73], [-30, -72], [-15, -70], [0, -70], [15, -68],
    [30, -67], [45, -66], [60, -66], [75, -66], [90, -66], [105, -66],
    [120, -67], [135, -65], [150, -73], [165, -77], [180, -72],
    [180, -85], [-180, -85], [-180, -72]
  ]],
];

// Major cities with lat/lon + IANA timezone — used for nearest-neighbor pin resolution
window.WORLD_CITIES = [
  // North America
  { name: "New York", tz: "America/New_York", lat: 40.71, lon: -74.01 },
  { name: "Washington D.C.", tz: "America/New_York", lat: 38.9, lon: -77.04 },
  { name: "Toronto", tz: "America/Toronto", lat: 43.65, lon: -79.38 },
  { name: "Montreal", tz: "America/Toronto", lat: 45.5, lon: -73.57 },
  { name: "Miami", tz: "America/New_York", lat: 25.76, lon: -80.19 },
  { name: "Atlanta", tz: "America/New_York", lat: 33.75, lon: -84.39 },
  { name: "Chicago", tz: "America/Chicago", lat: 41.88, lon: -87.63 },
  { name: "Dallas", tz: "America/Chicago", lat: 32.78, lon: -96.8 },
  { name: "Houston", tz: "America/Chicago", lat: 29.76, lon: -95.37 },
  { name: "Mexico City", tz: "America/Mexico_City", lat: 19.43, lon: -99.13 },
  { name: "Denver", tz: "America/Denver", lat: 39.74, lon: -104.99 },
  { name: "Phoenix", tz: "America/Phoenix", lat: 33.45, lon: -112.07 },
  { name: "Los Angeles", tz: "America/Los_Angeles", lat: 34.05, lon: -118.24 },
  { name: "San Francisco", tz: "America/Los_Angeles", lat: 37.77, lon: -122.42 },
  { name: "Seattle", tz: "America/Los_Angeles", lat: 47.6, lon: -122.33 },
  { name: "Vancouver", tz: "America/Vancouver", lat: 49.28, lon: -123.12 },
  { name: "Anchorage", tz: "America/Anchorage", lat: 61.22, lon: -149.9 },
  { name: "Honolulu", tz: "Pacific/Honolulu", lat: 21.31, lon: -157.86 },
  { name: "Havana", tz: "America/Havana", lat: 23.13, lon: -82.38 },

  // South America
  { name: "São Paulo", tz: "America/Sao_Paulo", lat: -23.55, lon: -46.63 },
  { name: "Rio de Janeiro", tz: "America/Sao_Paulo", lat: -22.91, lon: -43.17 },
  { name: "Buenos Aires", tz: "America/Argentina/Buenos_Aires", lat: -34.6, lon: -58.38 },
  { name: "Santiago", tz: "America/Santiago", lat: -33.45, lon: -70.67 },
  { name: "Lima", tz: "America/Lima", lat: -12.05, lon: -77.04 },
  { name: "Bogotá", tz: "America/Bogota", lat: 4.71, lon: -74.07 },
  { name: "Caracas", tz: "America/Caracas", lat: 10.48, lon: -66.9 },
  { name: "Quito", tz: "America/Guayaquil", lat: -0.18, lon: -78.47 },
  { name: "La Paz", tz: "America/La_Paz", lat: -16.5, lon: -68.15 },

  // Europe
  { name: "London", tz: "Europe/London", lat: 51.51, lon: -0.13 },
  { name: "Dublin", tz: "Europe/Dublin", lat: 53.35, lon: -6.26 },
  { name: "Reykjavik", tz: "Atlantic/Reykjavik", lat: 64.13, lon: -21.94 },
  { name: "Lisbon", tz: "Europe/Lisbon", lat: 38.72, lon: -9.14 },
  { name: "Madrid", tz: "Europe/Madrid", lat: 40.42, lon: -3.7 },
  { name: "Paris", tz: "Europe/Paris", lat: 48.86, lon: 2.35 },
  { name: "Amsterdam", tz: "Europe/Amsterdam", lat: 52.37, lon: 4.9 },
  { name: "Brussels", tz: "Europe/Brussels", lat: 50.85, lon: 4.35 },
  { name: "Berlin", tz: "Europe/Berlin", lat: 52.52, lon: 13.4 },
  { name: "Zurich", tz: "Europe/Zurich", lat: 47.38, lon: 8.54 },
  { name: "Rome", tz: "Europe/Rome", lat: 41.9, lon: 12.5 },
  { name: "Vienna", tz: "Europe/Vienna", lat: 48.21, lon: 16.37 },
  { name: "Prague", tz: "Europe/Prague", lat: 50.08, lon: 14.44 },
  { name: "Warsaw", tz: "Europe/Warsaw", lat: 52.23, lon: 21.01 },
  { name: "Stockholm", tz: "Europe/Stockholm", lat: 59.33, lon: 18.07 },
  { name: "Oslo", tz: "Europe/Oslo", lat: 59.91, lon: 10.75 },
  { name: "Copenhagen", tz: "Europe/Copenhagen", lat: 55.68, lon: 12.57 },
  { name: "Helsinki", tz: "Europe/Helsinki", lat: 60.17, lon: 24.94 },
  { name: "Athens", tz: "Europe/Athens", lat: 37.98, lon: 23.73 },
  { name: "Istanbul", tz: "Europe/Istanbul", lat: 41.01, lon: 28.98 },
  { name: "Moscow", tz: "Europe/Moscow", lat: 55.76, lon: 37.62 },
  { name: "Kyiv", tz: "Europe/Kyiv", lat: 50.45, lon: 30.52 },
  { name: "Bucharest", tz: "Europe/Bucharest", lat: 44.43, lon: 26.1 },

  // Africa
  { name: "Cairo", tz: "Africa/Cairo", lat: 30.04, lon: 31.24 },
  { name: "Lagos", tz: "Africa/Lagos", lat: 6.52, lon: 3.38 },
  { name: "Nairobi", tz: "Africa/Nairobi", lat: -1.29, lon: 36.82 },
  { name: "Addis Ababa", tz: "Africa/Addis_Ababa", lat: 9.03, lon: 38.74 },
  { name: "Johannesburg", tz: "Africa/Johannesburg", lat: -26.2, lon: 28.05 },
  { name: "Cape Town", tz: "Africa/Johannesburg", lat: -33.92, lon: 18.42 },
  { name: "Casablanca", tz: "Africa/Casablanca", lat: 33.57, lon: -7.59 },
  { name: "Accra", tz: "Africa/Accra", lat: 5.6, lon: -0.19 },
  { name: "Dakar", tz: "Africa/Dakar", lat: 14.72, lon: -17.47 },
  { name: "Algiers", tz: "Africa/Algiers", lat: 36.75, lon: 3.06 },

  // Middle East
  { name: "Jerusalem", tz: "Asia/Jerusalem", lat: 31.78, lon: 35.22 },
  { name: "Dubai", tz: "Asia/Dubai", lat: 25.2, lon: 55.27 },
  { name: "Riyadh", tz: "Asia/Riyadh", lat: 24.71, lon: 46.67 },
  { name: "Doha", tz: "Asia/Qatar", lat: 25.29, lon: 51.53 },
  { name: "Tehran", tz: "Asia/Tehran", lat: 35.69, lon: 51.39 },
  { name: "Baghdad", tz: "Asia/Baghdad", lat: 33.32, lon: 44.36 },
  { name: "Baku", tz: "Asia/Baku", lat: 40.41, lon: 49.87 },

  // Central / South Asia
  { name: "Kabul", tz: "Asia/Kabul", lat: 34.53, lon: 69.17 },
  { name: "Karachi", tz: "Asia/Karachi", lat: 24.86, lon: 67.01 },
  { name: "Tashkent", tz: "Asia/Tashkent", lat: 41.3, lon: 69.24 },
  { name: "Almaty", tz: "Asia/Almaty", lat: 43.25, lon: 76.95 },
  { name: "Delhi", tz: "Asia/Kolkata", lat: 28.61, lon: 77.21 },
  { name: "Mumbai", tz: "Asia/Kolkata", lat: 19.08, lon: 72.88 },
  { name: "Bengaluru", tz: "Asia/Kolkata", lat: 12.97, lon: 77.59 },
  { name: "Kolkata", tz: "Asia/Kolkata", lat: 22.57, lon: 88.36 },
  { name: "Dhaka", tz: "Asia/Dhaka", lat: 23.81, lon: 90.41 },
  { name: "Kathmandu", tz: "Asia/Kathmandu", lat: 27.72, lon: 85.32 },
  { name: "Colombo", tz: "Asia/Colombo", lat: 6.93, lon: 79.86 },

  // East / SE Asia
  { name: "Bangkok", tz: "Asia/Bangkok", lat: 13.76, lon: 100.5 },
  { name: "Hanoi", tz: "Asia/Ho_Chi_Minh", lat: 21.03, lon: 105.85 },
  { name: "Ho Chi Minh City", tz: "Asia/Ho_Chi_Minh", lat: 10.82, lon: 106.63 },
  { name: "Jakarta", tz: "Asia/Jakarta", lat: -6.2, lon: 106.85 },
  { name: "Kuala Lumpur", tz: "Asia/Kuala_Lumpur", lat: 3.14, lon: 101.69 },
  { name: "Singapore", tz: "Asia/Singapore", lat: 1.35, lon: 103.82 },
  { name: "Manila", tz: "Asia/Manila", lat: 14.6, lon: 120.98 },
  { name: "Hong Kong", tz: "Asia/Hong_Kong", lat: 22.32, lon: 114.17 },
  { name: "Taipei", tz: "Asia/Taipei", lat: 25.03, lon: 121.57 },
  { name: "Shanghai", tz: "Asia/Shanghai", lat: 31.23, lon: 121.47 },
  { name: "Beijing", tz: "Asia/Shanghai", lat: 39.9, lon: 116.41 },
  { name: "Seoul", tz: "Asia/Seoul", lat: 37.57, lon: 126.98 },
  { name: "Tokyo", tz: "Asia/Tokyo", lat: 35.68, lon: 139.69 },
  { name: "Osaka", tz: "Asia/Tokyo", lat: 34.69, lon: 135.5 },
  { name: "Vladivostok", tz: "Asia/Vladivostok", lat: 43.12, lon: 131.89 },
  { name: "Novosibirsk", tz: "Asia/Novosibirsk", lat: 55.04, lon: 82.93 },
  { name: "Ulaanbaatar", tz: "Asia/Ulaanbaatar", lat: 47.89, lon: 106.91 },

  // Oceania
  { name: "Sydney", tz: "Australia/Sydney", lat: -33.87, lon: 151.21 },
  { name: "Melbourne", tz: "Australia/Melbourne", lat: -37.81, lon: 144.96 },
  { name: "Brisbane", tz: "Australia/Brisbane", lat: -27.47, lon: 153.03 },
  { name: "Perth", tz: "Australia/Perth", lat: -31.95, lon: 115.86 },
  { name: "Adelaide", tz: "Australia/Adelaide", lat: -34.93, lon: 138.6 },
  { name: "Darwin", tz: "Australia/Darwin", lat: -12.46, lon: 130.85 },
  { name: "Auckland", tz: "Pacific/Auckland", lat: -36.85, lon: 174.76 },
  { name: "Wellington", tz: "Pacific/Auckland", lat: -41.29, lon: 174.78 },
  { name: "Suva", tz: "Pacific/Fiji", lat: -18.14, lon: 178.44 },
];
