import puppeteer from 'puppeteer-extra';
import { formatFetchedAukroData } from "../utils/formatUtils.js";
// data from bazos
export const getBazosData = async (searchedText, count) => {
    const url = `https://www.bazos.cz/search.php?hledat=${searchedText}&rubriky=www&hlokalita=&humkreis=25&cenaod=&cenado=&Submit=Hledat&order=&kitx=ano`;
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'load' });
    let pageCount = 0;
    const reqCount = count;
    let bazosItemsArr = [];
    const bazosItemsCount = await page?.evaluate(() => {
        const count = document.querySelector('.inzeratynadpis')?.textContent || '';
        return count.substring(count.lastIndexOf('z') + 2);
    });
    while (bazosItemsArr.length < reqCount) {
        pageCount = pageCount + 1;
        const bazosItems = await page?.evaluate((pageCounter) => {
            const items = Array.from(document.querySelectorAll('.inzeraty.inzeratyflex'));
            const data = items.map((item, index) => {
                const id = pageCounter.toString() + index.toString();
                const title = item.querySelector('.nadpis a')?.textContent || '';
                const price = item.querySelector('.inzeratycena b')?.textContent || '';
                const date = item.querySelector('.velikost10')?.textContent || '';
                const location = item.querySelector('.inzeratylok')?.textContent || '';
                const image = item.querySelector('.obrazek')?.getAttribute('src') || '';
                const link = item.querySelector('.nadpis a')?.getAttribute('href') || '';
                const top = item.querySelector('.velikost10')?.textContent.includes("TOP");
                return {
                    id,
                    title,
                    price: price.trimStart(),
                    date: date.substring(date.indexOf('[') + 1, date.indexOf(']')),
                    location: {
                        location: location.replace(/\d+/g, '').trimEnd(),
                        region: ''
                    },
                    image: image,
                    bazar: 'bazos',
                    auction: false,
                    link,
                    top
                };
            });
            return data;
        }, pageCount);
        bazosItemsArr.push(...bazosItems);
        await new Promise(resolve => setTimeout(resolve, 500));
        await page.click('.strankovani a:last-child b');
    }
    const bazosData = {
        itemsCount: bazosItemsCount,
        itemsList: bazosItemsArr
    };
    await browser.close();
    return bazosData;
};
// data from aukro
export const getAukroData = async (searchedText, count) => {
    const url = "https://aukro.cz/";
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'load' });
    let content = [];
    let pageInfo = {};
    page.on('response', async (response) => {
        if (response.url().includes('searchItemsCommon')) {
            const res = await response.json();
            content.push(...res?.content);
            pageInfo = res?.page;
        }
    });
    await page.type('#headerSearchInput', searchedText);
    await page.click('.auk-button.transition-base.size-sm-normal.tw-rounded-full');
    await new Promise(resolve => setTimeout(resolve, 500));
    while (content.length < count) {
        await page.waitForSelector('.page-number.next');
        await page.click('.page-number.next');
        page.on('response', async (response) => {
            if (response.url().includes('searchItemsCommon')) {
                const res = await response.json();
                content.push(...res?.content);
            }
        });
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    await browser.close();
    return formatFetchedAukroData(content, pageInfo);
};
// data from marketplace
export const getMarketplaceData = async (searchedText, count) => {
    const url = `https://cs-cz.facebook.com/marketplace/prague/search?sortBy=creation_time_descend&query=${searchedText}&exact=false`;
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'load' });
    const wrapperDiv = await page.waitForSelector(".x1xfsgkm.xqmdsaz.x1cnzs8.x4v5mdz.xjfs22q");
    let pageCount = 0;
    let marketplaceItemsArr = [];
    let itemsCount = 0;
    while (marketplaceItemsArr.length < count) {
        pageCount = pageCount + 1;
        const bazosItems = await page?.evaluate((pageCounter) => {
            const items = Array.from(document.querySelectorAll('.x3ct3a4'));
            const data = items.map((item, index) => {
                const id = pageCounter.toString() + index.toString();
                const title = item.querySelector('.x1lliihq.x6ikm8r.x10wlt62.x1n2onr6')?.textContent || '';
                const price = item.querySelector('.x78zum5.x1q0g3np.x1iorvi4.x4uap5.xjkvuk6.xkhd6sd span')?.textContent || '';
                const date = '';
                const location = item.querySelector('.x1lliihq.x6ikm8r.x10wlt62.x1n2onr6.xlyipyv.xuxw1ft')?.textContent || '';
                const image = item.querySelector('.xt7dq6l.xl1xv1r.x6ikm8r.x10wlt62.xh8yej3')?.getAttribute('src') || '';
                const link = item.querySelector('.x3ct3a4 a')?.getAttribute('href') || '';
                const top = false;
                return {
                    id,
                    title,
                    price,
                    date,
                    location: {
                        location,
                        region: ''
                    },
                    image,
                    bazar: 'marketplace',
                    auction: false,
                    link,
                    top
                };
            });
            return data;
        }, pageCount);
        const marketplaceCount = await page.evaluate(() => {
            const outerDivs = document.querySelectorAll('.xkrivgy.x1gryazu.x1n2onr6');
            let count = 1;
            outerDivs.forEach((outerDiv) => {
                const innerDivs = outerDiv.querySelectorAll('.x8gbvx8.x78zum5.x1q0g3np.x1a02dak.x1nhvcw1.x1rdy4ex.xcud41i.x4vbgl9.x139jcc6 div');
                count += innerDivs.length;
            });
            return count;
        });
        itemsCount = itemsCount + marketplaceCount;
        marketplaceItemsArr.push(...bazosItems);
        await page.evaluate((e) => e?.scrollTo(0, e?.scrollHeight), wrapperDiv);
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    const marketplaceData = {
        itemsCount: `${itemsCount.toString()}+`,
        itemsList: marketplaceItemsArr
    };
    await browser.close();
    return marketplaceData;
};
//# sourceMappingURL=scrpFn.js.map