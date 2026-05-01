const fs = require('fs');

// Read the CSV
const rawData = fs.readFileSync('worldcities.csv', 'utf-8');
const lines = rawData.split('\n');
const cities = [];

// The CSV headers are roughly:
// 0: city, 1: city_ascii, 2: lat, 3: lng, 4: country, 8: capital, 9: population
for (let i = 1; i < lines.length; i++) {
  // Split by "," to handle the CSV formatting properly
  const cols = lines[i].split('","').map(c => c.replace(/"/g, '')); 
  
  if (cols.length >= 10) {
    const city = cols[0];
    const lat = parseFloat(cols[2]);
    const lng = parseFloat(cols[3]);
    const country = cols[4];
    const capitalStatus = cols[8]; // 'primary', 'admin', 'minor', or empty
    const population = parseFloat(cols[9]) || 0;

    if (isNaN(lat) || isNaN(lng)) continue;

    let shouldInclude = false;

    // RULE 1: Grab ALL Indian National and State/UT Capitals (regardless of population)
    if (country === 'India' && (capitalStatus === 'primary' || capitalStatus === 'admin')) {
      shouldInclude = true;
    } 
    // RULE 2: Deep map of major cities for your specified target countries
    else if (['India', 'United States', 'United Kingdom', 'China', 'France', 'Canada'].includes(country)) {
      if (population > 100000) { 
        shouldInclude = true; 
      }
    } 
    // RULE 3: Global uniformity (Grab major cities from the rest of the world so the map isn't blank)
    else {
      if (population > 500000) { 
        shouldInclude = true; 
      }
    }

    if (shouldInclude) {
      cities.push({ city, lat, lng });
    }
  }
}

fs.writeFileSync('./public/cities.json', JSON.stringify(cities));
console.log(`Success! Custom filtered ${cities.length} cities to public/cities.json`);