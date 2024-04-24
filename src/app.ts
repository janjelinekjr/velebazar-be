import {MainData, MergedData, RequestBody, ResponseData} from "./types/AppData.js";
import {getAukroData, getBazosData, getMarketplaceData} from "./dataUtils/scrpFn.js";
import axios from "axios";
import {formatFetchedSbazarData, getPaginatedData} from "./utils/formatUtils.js";

import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import dotenv from 'dotenv';
import {v4 as uuidv4} from 'uuid'
import NodeCache from 'node-cache'

dotenv.config()

const app = express()
puppeteer.use(StealthPlugin())

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ["GET", "POST", 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}))

const dataSetCache = new NodeCache({stdTTL: 3600})

function cacheData(req: any, res: any, next: any) {
    const reqPayload: RequestBody = req.body

    const searchedQuery: string = reqPayload.text
    const requestId: string = reqPayload.requestId

    if (dataSetCache.has(`${requestId}:${searchedQuery}`)) {
        const data: any = dataSetCache.get(`${requestId}:${searchedQuery}`)
        const paginatedDataList = getPaginatedData(reqPayload.pageSet.page, reqPayload.pageSet.offset, data.mergedItemsList)

        res.status(200).json({
            data: {
                ...data,
                mergedItemsList: paginatedDataList
            }
        })
    } else {
        next()
    }
}

async function fetchAndSendData(req: any, res: any, next: any) {
    const reqPayload: RequestBody = req.body

    const searchedQuery: string = reqPayload.text
    const requiredCount: number = reqPayload.count
    const offset: number = reqPayload.pageSet.offset
    const requestId: string = uuidv4()

    // get bazos data
    const bazosData = await getBazosData(searchedQuery, requiredCount)

    // get marketplace data
    const marketplaceData = await getMarketplaceData(searchedQuery, requiredCount)

    // get sbazar data
    const sbazarFetch = await axios.get(`https://www.sbazar.cz/api/v1/items/search?offset=0&sort=-create_date&phrase=${searchedQuery}&limit=${requiredCount}`)
    const sbazarData: MainData = formatFetchedSbazarData(sbazarFetch.data)

    // get aukro data
    const aukroData: MainData = await getAukroData(searchedQuery, requiredCount)

    // merge data to response
    const mergedData: MergedData = {
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
    }

    const responseData: ResponseData = {
        requestId,
        totalPages: Math.ceil(mergedData.mergedItemsList.length / offset),
        ...mergedData,
    }

    dataSetCache.set(`${requestId}:${searchedQuery}`, responseData)

    // response
    res.status(200).json({
        data: responseData
    })
}

app.post('/searchedItems', cacheData, fetchAndSendData)

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