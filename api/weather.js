import 'dotenv/config';
import fetch from 'node-fetch';
export default async function handler(req, res) {
  const appid = process.env.appid;
  const mapskey = process.env.mapskey;
  const lat = req.query.lat;
  const lon = req.query.lon;
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${appid}&units=metric&lang=ru`;
  const geocodeUrl = `https://geocode-maps.yandex.ru/1.x?apikey=${mapskey}&geocode=${lon},${lat}&lang=ru_RU&kind=locality&results=1&format=json`;

  try {
    const response = await fetch(weatherUrl);
    const data = await response.json();
    const georesponse = await fetch(geocodeUrl);
    const result = await georesponse.json();
    data['city'] = result['response']['GeoObjectCollection']['featureMember'][0]['GeoObject']['name'];
    res.status(200).json(data); 
  } catch (error) {
    res.status(500).json({ error: error.message,url:weatherUrl });
  }
}