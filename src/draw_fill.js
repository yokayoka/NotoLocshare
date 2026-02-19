// 盛土ポリゴンレイヤー（fill.geojson）
// 森林総合研究所 & Bridge Project による大規模盛土分布データ
var lyrFill = L.layerGroup();

fetch('src/ffpri_json/fill.geojson')
  .then(function(response) { return response.json(); })
  .then(function(data) {
    L.geoJSON(data, {
      style: {
        color: '#FF8C00',
        weight: 2,
        opacity: 1,
        fillColor: '#FF8C00',
        fillOpacity: 0.5
      },
      attribution: 'FFPRI & Bridge Project'
    }).addTo(lyrFill);
  });
