/* 
  Here is the Server
  To run the server: node server.js
  Before running the server, make sure your frontend domain assign to environment variable FRONTEND_DOMAIN
*/


const axios = require('axios');
const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const helmet = require('helmet');
const tooBusy = require('toobusy-js');
const rateLimitMiddleware = require('./middleware/RateLimiter');


// the Port that server running on, you can change it with the env variables
const PORT = process.env.PORT;


// Allow only this domain or domains to access the website
app.use(cors({ origin: [process.env.FRONTEND_DOMAIN, process.env.FRONTEND_DOMAIN2], credentials: true, allowedHeaders: ['Content-Type', 'Authorization', 'authorization'] }));


// Some of express adjustment, optimization & security
app.use(express.urlencoded({ extended: false })); 
app.use(express.json());
app.use(helmet());
app.use(function (req, res, next) {
    if(tooBusy()){
        return res.status(503).send("The server is too busy, please try again after a moment");
    } else {
        next();
    }
});
app.set('trust proxy', 1);
app.use(rateLimitMiddleware);


// Handle the GET api request here
app.get('/', async(req, res) => {

    if(!req || !req.query) return res.status(400).send('Please enter orderId');

    const { orderId } = req.query;

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

        if(!fetchedData.data || fetchedData.status !== 200) return res.status(fetchedData.status).send('Error fetching data');

        res.status(200).send(fetchedData.data);
        
    } catch(err) {
        console.log(err.message);
        return res.status(500).send('Error occured');
    }

});


// Running the server
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}
    MOBIMATTER_BASE_URL: ${process.env.MOBIMATTER_BASE_URL}
    FRONTEND_DOMAIN1: ${process.env.FRONTEND_DOMAIN}
    FRONTEND_DOMAIN2: ${process.env.FRONTEND_DOMAIN2}`);
});