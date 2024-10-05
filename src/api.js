const apiKey = 'YOUR_NASA_API_KEY';  
const apiUrl = `https://api.nasa.gov/neo/rest/v1/feed?api_key=${apiKey}`;

export async function getNeoData() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        const neoObjects = data.near_earth_objects[Object.keys(data.near_earth_objects)[0]].map(neo => ({
            size: Math.log(neo.estimated_diameter.kilometers.estimated_diameter_max) * 2,  
            position: {
                x: Math.random() * 100 - 50,
                y: Math.random() * 100 - 50,
                z: Math.random() * 100 - 50
            }
        }));
        
        return neoObjects;
    } catch (error) {
        console.error('Error fetching NEO data:', error);
        return [];
    }
}
