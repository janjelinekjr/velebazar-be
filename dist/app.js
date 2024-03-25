import { getAukroData, getBazosData, getMarketplaceData } from "./dataUtils/scrpFn.js";
import axios from "axios";
import { formatFetchedSbazarData } from "./utils/formatUtils.js";
import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
puppeteer.use(StealthPlugin());
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ["GET", "POST", 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));
app.post('/searchedItems', async (req, res) => {
    const searchedQuery = req.body.text;
    const requiredCount = req.body.count;
    // get bazos data
    const bazosData = await getBazosData(searchedQuery, requiredCount);
    // get marketplace data
    const marketplaceData = await getMarketplaceData(searchedQuery, requiredCount);
    // get sbazar data
    const sbazarFetch = await axios.get(`https://www.sbazar.cz/api/v1/items/search?offset=0&sort=-create_date&phrase=${searchedQuery}&limit=${requiredCount}`);
    const sbazarData = formatFetchedSbazarData(sbazarFetch.data);
    // get aukro data
    const aukroData = await getAukroData(searchedQuery, requiredCount);
    // merge data to response
    const mergedData = {
        totalItemsCount: {
            bazos: bazosData.itemsCount,
            sbazar: sbazarData.itemsCount,
            aukro: aukroData.itemsCount,
            marketplace: marketplaceData.itemsCount,
        },
        currentItemsCount: {
            bazos: bazosData.itemsList.length,
            sbazar: sbazarData.itemsList.length,
            aukro: aukroData.itemsList.length,
            marketplace: marketplaceData.itemsList.length,
        },
        mergedItemsList: [
            ...bazosData.itemsList,
            ...marketplaceData.itemsList,
            ...sbazarData.itemsList,
            ...aukroData.itemsList
        ]
    };
    // response
    res.status(200).json({
        data: {
            mergedData,
        }
    });
});
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});
process.on('unhandledRejection', err => {
    console.log('Unhandled rejection. Shutting down...');
    console.log(err);
    server.close(() => {
        process.exit(1);
    });
});
//# sourceMappingURL=app.js.map