import {AukroResultItem, FetchSbazarGoodsResult, Page} from "../types/FetchData.js";
import {Item, MainData, SortEnum} from "../types/AppData.js";

export const formatDate = (date: string) => new Date(date).toLocaleDateString().replaceAll(" ", "")

export const trimAllSpaces = (value: string): string => {
    return value.replaceAll(" ", "")
}

export const getPaginatedAndSortData = (page: number, offset: number, sortBy: string, data: Item[]): Item[] => {
    const startIndex: number = (page - 1) * offset
    const endIndex: number = page * offset
    const sortedData = sortItemsList(data, sortBy)

    return sortedData.slice(startIndex, endIndex)
}

export const randomSortArray = (array: Array<any>) => {
    let newArray = array.slice()
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = newArray[i];
        newArray[i] = newArray[j];
        newArray[j] = temp;
    }
    return newArray
}

export const sortItemsList = (items: Item[], sortBy: string): Item[] => {
        switch (sortBy) {
            case SortEnum.dateAsc:
                return items?.sort((date1, date2) => (Number(new Date(date1.date)) - Number(new Date(date2.date))))
            case SortEnum.dateDesc:
                return items?.sort((date1, date2) => (Number(new Date(date2.date)) - Number(new Date(date1.date))))
            case SortEnum.priceAsc:
                return items.sort((price1, price2) => Number(price1.price.slice(0, price1.price.lastIndexOf(" "))) - Number(price2.price.slice(0, price2.price.lastIndexOf(" "))))
            case SortEnum.priceDesc:
                return items.sort((price1, price2) => Number(price2.price.slice(0, price2.price.lastIndexOf(" "))) - Number(price1.price.slice(0, price1.price.lastIndexOf(" "))))
            default:
                return items
        }
}

export function formatFetchedSbazarData(data: FetchSbazarGoodsResult): MainData {
    return {
        itemsCount: Number(trimAllSpaces(data?.pagination?.total?.toString())),
        itemsList: data?.results?.map(item => {
            return {
                id: item.id,
                title: item.name,
                date: formatDate(item.create_date),
                price: trimAllSpaces(item.price.toString()),
                currency: "Kč",
                auction: false,
                image: `https:${item.images[0]?.url}?fl=exf|res,280,280,3|jpg,80,,1`,
                top: item.topped,
                link: `https://www.sbazar.cz/${item.user.user_service.shop_url}/detail/${item.seo_name}`,
                location: {
                    location: item.locality.municipality,
                    region: item.locality.region
                },
                bazar: 'sbazar',
                user: item.user.user_service.shop_url,
                seo_name: item.seo_name,
                price_by_agree: item.price_by_agreement
            }
        })
    }
}

export function formatFetchedAukroData(items: AukroResultItem[], page: Page | {}): MainData {
    return {
        itemsCount: Number(trimAllSpaces((page as Page)?.totalElements?.toString())),
        itemsList: items?.map(item => {
            return {
                id: item.itemId,
                title: item.itemName,
                date: formatDate(item.startingTime),
                auction: item.auction,
                price: trimAllSpaces(item.price.amount.toString()),
                currency: item.price.currency,
                image: item.titleImageUrl,
                top: item.ppPriorityList,
                link: `https://www.aukro.cz/${item.seoUrl}-${item.itemId}`,
                location: {
                    location: item.location,
                    region: item.locationRegion?.cityName
                },
                bazar: 'aukro',
                user: item.seller.showName,
                seo_name: item.seoUrl
            }
        })
    }
}