import { makeApiRequest, parseBuyOrSell, parseLot, parseSymbol, findIntersect, millisecondsToDate } from './helpers.js';


// DatafeedConfiguration implementation
const configurationData = {
    // Represents the resolutions for bars supported by your datafeed
    supported_resolutions: ['1', '2', "3", "4", "5", "10", "15", "20", "30", "60", "75", "120", "240", '1D', '1W', '1M'],
    // The `exchanges` arguments are used for the `searchSymbols` method if a user selects the exchange
    // exchanges: [
    //     { value: 'Bitfinex', name: 'Bitfinex', desc: 'Bitfinex'},
    //     { value: 'Kraken', name: 'Kraken', desc: 'Kraken bitcoin exchange'},
    // ],
    // // The `symbols_types` arguments are used for the `searchSymbols` method if a user selects this symbol type
    // symbols_types: [
    //     { name: 'crypto', value: 'crypto'}
    // ]

    exchanges: [{ value: 'NSE', name: 'NSE', desc: 'NSE' },],
    // The `symbols_types` arguments are used for the `searchSymbols` method if a user selects this symbol type
    symbols_types: [
        { name: 'Options', value: 'Options' }
    ]
};

// Use it to keep a record of the most recent bar on the chart
const lastBarsCache = new Map();
var originalSymbolList = "";
// Obtains all symbols for all exchanges supported by CryptoCompare API

async function getAllSymbols(symbol) {
    let allSymbols = await makeApiRequest(`https://www.icharts.in/opt/api/tv/SearchDataForTV.php?limit=30&query=${symbol}&type=Options_Latest&exchange=NSE&default_symbol_type_val=Futures_Hist`);

    return allSymbols;
}

async function retrieveSingleLegBars(sybmolWhole, periodParams) {
    let symbol = parseSymbol(sybmolWhole);
    const From = millisecondsToDate(periodParams.from * 1000);
    const To = millisecondsToDate(periodParams.to * 1000);

    let bars = [];
    let url = `https://www.icharts.in/opt/api/tv/getDataForTV_API.php?symbol=${symbol}&resolution=1&from=${From}&to=${To}&DataRequest=0&SymbType=FNO`;
    const data = await makeApiRequest(url);
    const buy = parseBuyOrSell(sybmolWhole) == "B";
    const lot = parseLot(sybmolWhole)
    const totalLot = buy ? lot : -lot;

    let times = data.t;
    let lows = data.l;
    let highs = data.h;
    let closes = data.c;
    let opens = data.o;
    let volumes = data.v;
    if (times != null) {
        times.forEach((t, index) => {
            let bar = {
                time: times[index] * 1000,
                low: lows[index] * totalLot,
                high: highs[index] * totalLot,
                open: opens[index] * totalLot,
                close: closes[index] * totalLot,
                //volume: volumes[index]
            }
            bars.push(bar);
        });
    }

    return bars;
}

async function retrieveMultipleLegBars(periodParams) {
    const symbolList = originalSymbolList.split("|");

    let barsList = [];

    if (symbolList.length > 0) {
        for (var i = 0; i < symbolList.length; i++) {
            var sybmolWhole = symbolList[i];
            let bars = await retrieveSingleLegBars(sybmolWhole, periodParams);
            barsList.push(bars);
        }
    }
    return barsList;
}

async function getIntersection(bars1, bars2) {
    let insertion = findIntersect(bars1, bars2);
    return insertion;
}

async function merge2Bars(bars1, bars2) {
    let finalBars = [];
    let times = await getIntersection(bars1, bars2);
    if (times != null) {
        times.forEach((time, index) => {
            let bar = {
                time: time,
                low: bars1[index].low + bars2[index].low,
                high: bars1[index].high + bars2[index].high,
                open: bars1[index].open + bars2[index].open,
                close: bars1[index].close + bars2[index].close
            }

            finalBars.push(bar);
        });
    }
    return finalBars;
}

async function mergeData(periodParams) {
    let barsList = await retrieveMultipleLegBars(periodParams);
    if (barsList.length == 1) {
        return barsList[0];
    }
    let nextBarList = barsList[0];
    for (var i = 0; i < barsList.length - 1; i++) {
        nextBarList = await merge2Bars(nextBarList, barsList[i + 1]);

    }

    return nextBarList;

}

export default {

    onReady: (callback) => {
        //    console.log('[onReady]: Method call');
        setTimeout(() => callback(configurationData));
    },

    searchSymbols: async (
        userInput,
        exchange,
        symbolType,
        onResultReadyCallback
    ) => {
        //     console.log('[searchSymbols]: Method call');

        const symbols = await getAllSymbols(userInput);
        const newSymbols = symbols.filter(symbol => {
            const isExchangeValid = exchange === '' || symbol.exchange === exchange;
            const isFullSymbolContainsInput = symbol.full_name
                .toLowerCase()
                .indexOf(userInput.toLowerCase()) !== -1;
            return isExchangeValid && isFullSymbolContainsInput;
        });
        onResultReadyCallback(symbols);
    },

    resolveSymbol: async (
        symbolName,
        onSymbolResolvedCallback,
        onResolveErrorCallback,
        extension
    ) => {
        //     console.log('[resolveSymbol]: Method call', symbolName);
        originalSymbolList = symbolName;
        const symbolList = symbolName.split("|");
        if (symbolList.length > 0) {
            const result = parseSymbol(symbolList[0]);
            if (result) {
                const symbolInfo = await makeApiRequest(`https://www.icharts.in/opt/api/tv/SymbolsDataForTV_API.php?symbol=${result}&val=Options_Latest&SymbType=FNO`);
                //       console.log(symbolInfo);

                onSymbolResolvedCallback(symbolInfo);
            }
        }
    },

    getBars: async (symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) => {
        console.log("periodParams", periodParams);
        let symbol = symbolInfo;

        const fetchData = async () => {
            try {
                let bars = await mergeData(periodParams);
                if (periodParams.firstDataRequest) {
                    lastBarsCache.set(symbol, { ...bars[bars.length - 1] });
                }
                onHistoryCallback(bars, { noData: false });
            } catch (error) {
                // onErrorCallback(error);
            }
        };

        fetchData();

         const intervalId = setInterval(() => {
             fetchData();
         }, 1000); 


        const cleanup = () => {
            clearInterval(intervalId);
        };

        return cleanup;
    },

    subscribeBars: (
        symbolInfo,
        resolution,
        onRealtimeCallback,
        subscriberUID,
        onResetCacheNeededCallback
    ) => {
        console.log('[subscribeBars]: Method call with subscriberUID:', subscriberUID);
        // subscribeOnStream(
        //     symbolInfo,
        //     resolution,
        //     onRealtimeCallback,
        //     subscriberUID,
        //     onResetCacheNeededCallback,
        //     lastBarsCache.get(symbolInfo.full_name)
        // );
    },

    unsubscribeBars: (subscriberUID) => {
        console.log('[unsubscribeBars]: Method call with subscriberUID:', subscriberUID);
        // unsubscribeFromStream(subscriberUID);
    },


};
