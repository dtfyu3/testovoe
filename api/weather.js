import 'dotenv/config';
import fetch from 'node-fetch';
export default async function handler(req, res) {
  const appid = process.env.appid; // Получаем ключ из переменной окружения
  const lat = req.query.lat;
  const lon = req.query.lon;
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${appid}&units=metric&lang=ru`;

  try {
    const response = await fetch(weatherUrl);
    const data = await response.json();
    res.status(200).json(data); // Возвращаем данные клиенту
  } catch (error) {
    res.status(500).json({ error: error.message,url:weatherUrl });
  }
}