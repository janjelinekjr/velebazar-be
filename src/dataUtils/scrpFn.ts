import {Item, MainData} from "../types/AppData.js";

import puppeteer from 'puppeteer-extra';
import {Browser} from "puppeteer";
import {AukroResultItem, FetchAukroGoodsResult, Page} from "../types/FetchData.js";
import {formatFetchedAukroData} from "../utils/formatUtils.js";

// data from bazos
export const getBazosData = async (searchedText: string, count: number) => {
    const url: string = `https://www.bazos.cz/search.php?hledat=${searchedText}&rubriky=www&hlokalita=&humkreis=25&cenaod=&cenado=&Submit=Hledat&order=&kitx=ano`
    const browser: Browser = await puppeteer.launch({headless: true})
    const page = await browser.newPage()
    await page.goto(url, {waitUntil: 'load'})

    let pageCount: number = 0
    const reqCount = count
    let bazosItemsArr: any[] = []

    const bazosItemsCount = await page?.evaluate(() => {
        const count = document.querySelector('.inzeratynadpis')?.textContent || ''
        return count.substring(count.lastIndexOf('z') + 2)
    })

    while (bazosItemsArr.length < reqCount) {
        pageCount = pageCount + 1
        const bazosItems = await page?.evaluate((pageCounter: number) => {
            const items = Array.from(document.querySelectorAll('.inzeraty.inzeratyflex'))
            const data: Item[] = items.map((item: any, index: number) => {
                const id: string = pageCounter.toString() + index.toString()
                const title = item.querySelector('.nadpis a')?.textContent || ''
                const price = item.querySelector('.inzeratycena b')?.textContent || ''
                const date = item.querySelector('.velikost10')?.textContent || ''
                const location = item.querySelector('.inzeratylok')?.textContent || ''
                const image = item.querySelector('.obrazek')?.getAttribute('src') || ''
                const link = item.querySelector('.nadpis a')?.getAttribute('href') || ''
                const top = item.querySelector('.velikost10')?.textContent.includes("TOP")

                return {
                    id: `baz${new Date().valueOf() * Number(id)}`,
                    title,
                    price,
                    currency: "",
                    date: date.substring(date.indexOf('[') + 1, date.indexOf(']')).replaceAll(" ", ""),
                    location: {
                        location: location.replace(/\d+/g, '').trimEnd(),
                        region: ''
                    },
                    image: image,
                    bazar: 'bazos',
                    auction: false,
                    link,
                    top
                }
            })

            return data
        }, pageCount)

        bazosItemsArr.push(...bazosItems)

        await new Promise(resolve => setTimeout(resolve, 500))
        await page.click('.strankovani a:last-child b')
    }

    const bazosData: MainData = {
        itemsCount: Number(bazosItemsCount.replaceAll(" ", "")),
        itemsList: bazosItemsArr
    }

    await browser.close()

    return bazosData
}

// data from aukro
export const getAukroData = async (searchedText: string, count: number) => {
    const url: string = "https://aukro.cz/"
    const browser: Browser = await puppeteer.launch({headless: true})
    const page = await browser.newPage()
    await page.goto(url, {waitUntil: 'load'})

    let content: AukroResultItem[] = []
    let pageInfo: Page | {} = {}
    page.on('response', async response => {
        if(response.url().includes('searchItemsCommon')) {
            const res: FetchAukroGoodsResult = await response.json()
            content.push(...res?.content)
            pageInfo = res?.page
        }
    });
    await page.type('#headerSearchInput', searchedText)
    await page.click('.auk-button.transition-base.size-sm-normal.tw-rounded-full')

    await new Promise(resolve => setTimeout(resolve, 500))

    while(content.length < count) {
        await page.waitForSelector('.page-number.next')
        await page.click('.page-number.next')
        page.on('response', async response => {
            if(response.url().includes('searchItemsCommon')) {
                const res: FetchAukroGoodsResult = await response.json()
                content.push(...res?.content)
            }
        });
        await new Promise(resolve => setTimeout(resolve, 500))
    }

    await browser.close()
    return formatFetchedAukroData(content, pageInfo)
}

// data from marketplace
export const getMarketplaceData = async (searchedText: string, count: number) => {
    const url: string = `https://cs-cz.facebook.com/marketplace/prague/search?sortBy=creation_time_descend&query=${searchedText}&exact=false`
    const browser: Browser = await puppeteer.launch({headless: true})
    const page = await browser.newPage()
    await page.goto(url, {waitUntil: 'load'})
    const wrapperDiv = await page.waitForSelector(".x1xfsgkm.xqmdsaz.x1cnzs8.x4v5mdz.xjfs22q")

    let pageCount: number = 0
    let marketplaceItemsArr: any[] = []
    let itemsCount = 0

    while (marketplaceItemsArr.length < count) {
        pageCount = pageCount + 1
        const bazosItems = await page?.evaluate((pageCounter: number) => {
            const items = Array.from(document.querySelectorAll('.x3ct3a4'))
            const data: Item[] = items.map((item: any, index: number) => {
                const id: string = pageCounter.toString() + index.toString()
                const title = item.querySelector('.x1lliihq.x6ikm8r.x10wlt62.x1n2onr6')?.textContent || ''
                const price = item.querySelector('.x78zum5.x1q0g3np.x1iorvi4.x4uap5.xjkvuk6.xkhd6sd span')?.textContent || ''
                const date = ''
                const location = item.querySelector('.x1lliihq.x6ikm8r.x10wlt62.x1n2onr6.xlyipyv.xuxw1ft')?.textContent || ''
                const image = item.querySelector('.xt7dq6l.xl1xv1r.x6ikm8r.x10wlt62.xh8yej3')?.getAttribute('src') || ''
                const link = item.querySelector('.x3ct3a4 a')?.getAttribute('href') || ''
                const top = false

                return {
                    id: `mar${new Date().valueOf() * Number(id)}`,
                    title,
                    price,
                    currency: "",
                    date,
                    location: {
                        location,
                        region: ''
                    },
                    image,
                    bazar: 'marketplace',
                    auction: false,
                    link: `https://cs-cz.facebook.com${link}`,
                    top
                }
            })

            return data
        }, pageCount)

        const marketplaceCount = await page.evaluate(() => {
            const outerDivs = document.querySelectorAll('.xkrivgy.x1gryazu.x1n2onr6');
            let count = 1;

            outerDivs.forEach((outerDiv: any) => {
                const innerDivs = outerDiv.querySelectorAll('.x8gbvx8.x78zum5.x1q0g3np.x1a02dak.x1nhvcw1.x1rdy4ex.xcud41i.x4vbgl9.x139jcc6 div');
                count += innerDivs.length;
            });

            return count;
        });

        itemsCount = itemsCount + marketplaceCount
        marketplaceItemsArr.push(...bazosItems)

        await page.evaluate((e) => e?.scrollTo(0, e?.scrollHeight), wrapperDiv)
        await new Promise(resolve => setTimeout(resolve, 500))
    }

    const marketplaceData: MainData = {
        itemsCount: itemsCount,
        itemsList: marketplaceItemsArr
    }

    await browser.close()

    return marketplaceData
}
