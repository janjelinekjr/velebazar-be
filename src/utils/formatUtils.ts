import {AukroResultItem, FetchSbazarGoodsResult, Page} from "../types/FetchData.js";
import {Item, MainData} from "../types/AppData.js";

export const formatDate = (date: string) => new Date(date).toLocaleDateString().replaceAll(" ", "")

export function trimAllSpaces(value: string): string {
    return value.replaceAll(" ", "")
}

export function getPaginatedData(page: number, offset: number, data: Item[]): Item[] {
    const startIndex: number = (page - 1) * offset
    const endIndex: number = page * offset

    return data.slice(startIndex, endIndex)
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