import {
	makeApiRequestHistory,
	makeApiRequestHistoryBinance,
	makeApiRequestHistoryBinanceui,
	generateSymbol,
	parseFullSymbol,
	getDeimalDetails,
	getResolution
} from "./helpers.js";
import {
	subscribeOnStream,
	unsubscribeFromStream,
} from './streaming';


const TEMP_FROM_BINANCE=true;

const lastBarsCache = new Map();

const configurationData = {
	minmov: 1,
	pricescale: 100000000,
	has_intraday: true,
	intraday_multipliers: ["1", "60"],
	exchanges: [
		{
			value: "Tradable_Exchange",
			name: "Tradable_Exchange",
			desc: "Tradable_Exchange",
		},
	],
	symbols_types: [
		{
			name: "crypto",

			value: "crypto",
		},
		// ...
	],
};

async function getAllSymbols() {
	const data = {
		HasWarning: false,
		Message: "",
		RateLimit: {},
		Response: "Success",
		Type: 100,
		Data: {
			"Tradable_Exchange": {
				pairs: {
					USDT: ["USD", "CNHT"],
					BTC: [
						"GBP",
						"XAUT",
						"EUR",
						"CNHT",
						"JPY",
						"USD",
						"EURT",
						"MIM",
						"USDT",
						"XCHF",
					],
					ETH: ["USD", "CNHT", "USDT"],
					USDT: [
						"GBP",
						"XAUT",
						"EUR",
						"CNHT",
						"JPY",
						"USD",
						"EURT",
						"MIM",
						"USDT",
						"XCHF",
					],
					XRP: ["USD", "CNHT", "USDT"],
					USDT: [
						"GBP",
						"XAUT",
						"EUR",
						"CNHT",
						"JPY",
						"USD",
						"EURT",
						"MIM",
						"USDT",
						"XCHF",
					],
					TRON: ["USD", "CNHT", "USDT"],
					USDT: [
						"GBP",
						"XAUT",
						"EUR",
						"CNHT",
						"JPY",
						"USD",
						"EURT",
						"MIM",
						"USDT",
						"XCHF",
					],
				},
				isActive: true,
				isTopTier: true,
			},
		},
	};
	let allSymbols = [];

	for (const exchange of configurationData.exchanges) {
		const pairs = data.Data[exchange.value]?.pairs;

		for (const leftPairPart of Object.keys(pairs)) {
			const symbols = pairs[leftPairPart].map((rightPairPart) => {
				const symbol = generateSymbol(
					exchange.value,
					leftPairPart,
					rightPairPart
				);
				return {
					symbol: symbol.short,
					full_name: symbol.full,
					description: symbol.short,
					exchange: exchange.value,
					type: "crypto",
				};
			});
			allSymbols = [...allSymbols, ...symbols];
		}
	}
	return allSymbols;
}

export default {
	onReady: (callback) => {
		setTimeout(() => callback(configurationData));
	},

	searchSymbols: async (
		userInput,
		exchange,
		symbolType,
		onResultReadyCallback
	) => {
		const symbols = await getAllSymbols();
		const newSymbols = symbols.filter((symbol) => {
			const isExchangeValid = exchange === "" || symbol.exchange === exchange;
			const isFullSymbolContainsInput =
				symbol.full_name.toLowerCase().indexOf(userInput.toLowerCase()) !== -1;
			return isExchangeValid && isFullSymbolContainsInput;
		});
		onResultReadyCallback(newSymbols);
	},

	resolveSymbol: async (
		symbolName,
		onSymbolResolvedCallback,
		onResolveErrorCallback
	) => {
		const symbols = await getAllSymbols();
		const symbolItem = symbols.find(
			({ full_name }) => full_name === symbolName
		);
		if (!symbolItem) {
			onResolveErrorCallback("cannot resolve symbol");
			return;
		}

		const decimal_data = await getDeimalDetails()
		let symbol_name = symbolItem.symbol.replace("/", "");
		if (symbol_name == 'TRONUSDT') {
			symbol_name = 'TRXUSDT';
		}
		let priceDecimal = decimal_data[symbol_name].RULES.SPOT_DEC_PRC_PTS;
		let pDecimal = decimal_data[symbol_name].RULES.SPOT_DEC_QTY_PTS;
		const symbolInfo = {
			ticker: symbolItem.full_name,
			name: symbolItem.symbol,
			description: symbolItem.description,
			type: symbolItem.type,
			session: "24x7",
			//timezone: "Etc/UTC",
			exchange: symbolItem.exchange,
			minmov: 1,
			pricescale: Math.pow(10, priceDecimal),
			has_intraday: true,
			has_no_volume: false,
			has_weekly_and_monthly: true,
			supported_resolutions: ["1", "3", "5", "15", "30", "60", "120", "240", "D", "W", "M"],
			volume_precision: pDecimal,
			data_status: "streaming",
			overrides: {
				paneProperties: {
					background: "#000000",
					vertGridProperties: {
						color: "#000000"
					},
					horzGridProperties: {
						color: "#000000"
					}
				},
				mainSeriesProperties: {
					candleStyle: {
						wickUpColor: "#000000",
						wickDownColor: "#000000"
					}
				},
			},
		};
		onSymbolResolvedCallback(symbolInfo);
	},

	getBars: async (
		symbolInfo,
		resolution,
		periodParams,
		onHistoryCallback,
		onErrorCallback
	) => {
		const { from, to, firstDataRequest } = periodParams;
		const parsedSymbol = parseFullSymbol(symbolInfo.full_name);
		let data_interval = getResolution(resolution)

		// Parameter for Binance Data
		const urlParametersBinance = {
			symbol: (parsedSymbol.fromSymbol == 'TRON' ? 'TRX' : parsedSymbol.fromSymbol) + parsedSymbol.toSymbol,
			interval: data_interval,
			// limit: 100,
			startTime: from * 1000,
			endTime: to * 1000
		}

		// Query for binance data
		const queryBinance = Object.keys(urlParametersBinance)
			.map((name) => `${name}=${encodeURIComponent(urlParametersBinance[name])}`)
			.join("&");

		try {

			let bars = [];


			if (TEMP_FROM_BINANCE){

			const binanceData = await makeApiRequestHistoryBinanceui('https://www.binance.com/api/v3', queryBinance)

				if (binanceData.length === 0) {
					// "noData" should be set if there is no data in the requested period.
					onHistoryCallback([], {
						noData: true,
					});
					return;
				}

				// Lets Load Binance Data
				binanceData.forEach((bar) => {
					let binance_time = bar[0] / 1000
					if (binance_time >= from && binance_time < to) {
						bars = [
							...bars,
							{
								time: Number(bar[0]),
								low: Number(bar[3]),
								high: Number(bar[2]),
								open: Number(bar[1]),
								close: Number(bar[4]),
								volume: Number(bar[5])
							}
						]
					}
				})
				// Finish lets load Binance Data

			}

			if (firstDataRequest) {
				lastBarsCache.set(symbolInfo.full_name, {
					...bars[bars.length - 1],
				});
			}
			onHistoryCallback(bars, {
				noData: false,
			});

		} catch (error) {
			console.log("[getBars]: Get error", error);
			onErrorCallback(error);
		}
	},

	subscribeBars: (
		symbolInfo,
		resolution,
		onRealtimeCallback,
		subscribeUID,
		onResetCacheNeededCallback
	) => {
		subscribeOnStream(
			symbolInfo,
			resolution,
			onRealtimeCallback,
			subscribeUID,
			onResetCacheNeededCallback,
			lastBarsCache.get(symbolInfo.full_name)
		);
	},

	unsubscribeBars: (subscriberUID) => {
		unsubscribeFromStream(subscriberUID);
	},
};
