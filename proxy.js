const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 4000;

app.get('/proxy', async (req, res) => {
    const { url } = req.query;
    try {
        console.log(`🔄 Прокси-запрос к: ${url}`);
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
        });
        res.set('Content-Type', response.headers['content-type']);
        res.send(response.data);
    } catch (error) {
        console.error(`❌ Ошибка при проксировании: ${error.message}`);
        res.status(500).send('Ошибка при загрузке изображения');
    }
});

app.listen(PORT, () => {
    console.log(`✅ Прокси-сервер запущен на http://localhost:${PORT}`);
});