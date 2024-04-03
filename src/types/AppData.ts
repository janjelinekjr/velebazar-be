export enum SortEnum {
    dateAsc = 'dateAsc',
    dateDesc = 'dateDesc',
    priceAsc = 'priceAsc',
    priceDesc = 'priceDesc'
}

export type MainData = {
    itemsCount: number,
    itemsList: Item[]
}

export type Item = {
    id: number | string,
    title: string,
    price: string,
    date: string,
    currency: string,
    location: {
        location: string,
        region: string
    }
    image: string,
    link: string,
    top: boolean,
    auction: boolean,
    bazar: string,
    seo_name?: string
    user?: string
    price_by_agree?: boolean
}

export type MergedData = {
    totalItemsCount: {
        bazos: number
        sbazar: number
        aukro: number
        marketplace: number
    }
    currentItemsCount: {
        bazos: number,
        sbazar: number,
        aukro: number,
        marketplace: number
    }
    mergedItemsList: Item[]
}

export type RequestBody = {
    requestId: string
    text: string
    count: number
    pageSet: {
        page: number
        sortBy: string
    }
}