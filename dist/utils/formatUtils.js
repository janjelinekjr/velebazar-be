export function formatFetchedSbazarData(data) {
    return {
        itemsCount: data?.pagination?.total?.toString(),
        itemsList: data?.results?.map(item => {
            return {
                id: item.id,
                title: item.name,
                date: item.create_date,
                price: item.price.toString(),
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
            };
        })
    };
}
export function formatFetchedAukroData(items, page) {
    return {
        itemsCount: page?.totalElements?.toString(),
        itemsList: items?.map(item => {
            return {
                id: item.itemId,
                title: item.itemName,
                date: item.startingTime,
                auction: item.auction,
                price: item.price.amount.toString(),
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
            };
        })
    };
}
//# sourceMappingURL=formatUtils.js.map