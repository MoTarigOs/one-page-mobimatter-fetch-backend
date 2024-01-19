const { default: axios } = require('axios');
const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const helmet = require('helmet');
const tooBusy =- require('toobusy-js');
const rateLimitMiddleware = require('./middleware/RateLimiter');

const PORT = process.env.PORT;

app.use(cors({ origin: ['http://127.0.0.1:5500'], credentials: true, allowedHeaders: ['Content-Type', 'Authorization', 'authorization'] }));
app.use(express.urlencoded( { extended: false })); 
app.use(express.json());
app.use(helmet());
app.use(function (req, res, next) {
    if(tooBusy()){
        return res.status(503).send("The server is too busy, please try again after a moment");
    } else {
        next();
    }
});
app.use(rateLimitMiddleware);

app.get('/get-mobimatter-data/:orderId', async(req, res) => {

    if(!req?.params) return res.status(400).send('Please enter orderId');

    const { orderId } = req.params;

    console.log(orderId);

    try {

        let config = {
            method: 'GET',
            maxBodyLength: Infinity,
            url: `${process.env.MOBIMATTER_BASE_URL}/${orderId}`,
            headers: { 
                'Accept': 'text/plain', 
                'merchantId': process.env.MOBIMATTER_MERCHANT_ID, 
                'api-key': process.env.MOBIMATTER_API_KEY
            }
        };

        const fetchedData = await axios(config);

        console.log(fetchedData);

        if(!fetchedData.data || fetchedData.status !== 200) return res.status(fetchedData.status).send('Error fetching data');

        res.status(200).json(fetchedData.data);
        
    } catch(err) {
        console.log(err.message);
        return res.status();
    }

});

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});