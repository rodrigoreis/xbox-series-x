const axios = require('axios');
const cheerio = require('cheerio');
const R = require('ramda');
const table = require('cli-table');

const storeMatrix = new Map([
    ['Amazon', {
        url: 'https://www.amazon.com.br/Microsoft-Console-Xbox-Series-X/dp/B088GHBH92',
        type: 'html',
        selector: 'span.a-offscreen',
        mustConvert: true
    }],
    ['Casas Bahia', {
        url: 'https://pdp-api.casasbahia.com.br/api/v2/sku/55014095/price/source/CB?utm_source=undefined&take=undefined&device_type=MOBILE',
        type: 'json',
        selector: ['sellPrice', 'priceValue'],
        mustConvert: false
    }],
    ['Extra', {
        url: 'https://pdp-api.extra.com.br/api/v2/sku/1510398328/price/source/EX?utm_source=undefined&take=undefined&device_type=MOBILE',
        type: 'json',
        selector: ['sellPrice', 'priceValue'],
        mustConvert: false
    }],
    ['Ponto Frio', {
        url: 'https://pdp-api.pontofrio.com.br/api/v2/sku/55014095/price/source/PF?utm_source=undefined&take=undefined&device_type=MOBILE',
        type: 'json',
        selector: ['sellPrice', 'priceValue'],
        mustConvert: false
    }]
])

const getNumberFromPrice = (price) => {
    const re = /(?:([rR]\$ |[rR]\$))(.+)/g
    return Number(re.exec(price)[2].replace('.', '').replace(',', '.'));
}

const formatPrice = (price) => {
    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    return formatter.format(price);
}

const getPriceTable = async () => {
    const t = new table({
        head: ['Loja', 'Preço'],
        colWidths: [20, 30]
    });

    for (let [key, value] of storeMatrix.entries()) {
        const response = await axios.get(value.url);
        if (value.type === 'html') {
            const htmlParser = cheerio.load(response.data);
            const htmlPersedPrice = htmlParser(value.selector).html();
            const htmlPrice = value.mustConvert ? getNumberFromPrice(htmlPersedPrice) : htmlPersedPrice;
            t.push([key, formatPrice(htmlPrice)]);
        } else {
            const jsonPrice = R.path(value.selector, response.data);
            t.push([key, formatPrice(jsonPrice)]);
        }
    }

    return t.toString();
}

getPriceTable().then((pTable) => console.log(pTable));