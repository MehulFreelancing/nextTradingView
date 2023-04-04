// Api For Load Binance Data
export async function makeApiRequestHistoryBinance(url, path) {
	const response = await fetch(`${url}/klines?${path}`);
	return response.json()
}

export async function getDeimalDetails() {
	try {
		return {
			"BTCUSDT": {
				"IN": "USDT",
				"OUT": "BTC",
				"RULES": {
					"SYMBOL": "BTCUSDT",
					"NAME": "Bitcoin",
					"MIN_QTY": 0.000158,
					"MIN_QTY2": 0.001,
					"MAX_QTY": 21,
					"MIN_ORDER_VALUE": 10,
					"MAX_ORDER_VALUE": 100000,
					"TICK_SIZE": 0.01,
					"INITIAL_MARGIN_BASE_VALUE": 1,
					"MAINTENANCE_MARGIN_BASE_VALUE": 0.5,
					"DEC_PTS": 3,
					"DEC_PRC_PTS": 2,
					"SPOT_MIN_QTY": 0.00001,
					"SPOT_MAX_QTY": 286.32246082,
					"SPOT_MIN_ORDER_VALUE": 5,
					"SPOT_MAX_ORDER_VALUE": 100000,
					"SPOT_DEC_QTY_PTS": 5,
					"SPOT_DEC_PRC_PTS": 2,
					"DERIV_MIN_QTY": 0.001,
					"DERIV_MAX_QTY": 1000,
					"DERIV_MIN_ORDER_VALUE": 5,
					"DERIV_MAX_ORDER_VALUE": 100000,
					"DERIV_DEC_QTY_PTS": 3,
					"DERIV_DEC_PRC_PTS": 1
				}
			},
			"ETHUSDT": {
				"IN": "USDT",
				"OUT": "ETH",
				"RULES": {
					"SYMBOL": "ETHUSDT",
					"NAME": "Ethereum",
					"MIN_QTY": 0.00224,
					"MIN_QTY2": 0.01,
					"MAX_QTY": 15,
					"MIN_ORDER_VALUE": 10,
					"MAX_ORDER_VALUE": 50000,
					"TICK_SIZE": 0.01,
					"INITIAL_MARGIN_BASE_VALUE": 1,
					"MAINTENANCE_MARGIN_BASE_VALUE": 0.5,
					"DEC_PTS": 2,
					"DEC_PRC_PTS": 2,
					"SPOT_MIN_QTY": 0.0001,
					"SPOT_MAX_QTY": 6709.13817258,
					"SPOT_MIN_ORDER_VALUE": 10,
					"SPOT_MAX_ORDER_VALUE": 50000,
					"SPOT_DEC_QTY_PTS": 4,
					"SPOT_DEC_PRC_PTS": 2,
					"DERIV_MIN_QTY": 0.001,
					"DERIV_MAX_QTY": 1000,
					"DERIV_MIN_ORDER_VALUE": 10,
					"DERIV_MAX_ORDER_VALUE": 100000,
					"DERIV_DEC_QTY_PTS": 3,
					"DERIV_DEC_PRC_PTS": 2
				}
			},
			"XRPUSDT": {
				"IN": "USDT",
				"OUT": "XRP",
				"RULES": {
					"SYMBOL": "XRPUSDT",
					"NAME": "Ripple",
					"MIN_QTY": 9.09,
					"MIN_QTY2": 1,
					"MAX_QTY": 27273,
					"MIN_ORDER_VALUE": 10,
					"MAX_ORDER_VALUE": 30000,
					"TICK_SIZE": 0.0001,
					"INITIAL_MARGIN_BASE_VALUE": 2,
					"MAINTENANCE_MARGIN_BASE_VALUE": 1,
					"DEC_PTS": 3,
					"DEC_PRC_PTS": 4,
					"SPOT_MIN_QTY": 1,
					"SPOT_MAX_QTY": 9222449,
					"SPOT_MIN_ORDER_VALUE": 10,
					"SPOT_MAX_ORDER_VALUE": 30000,
					"SPOT_DEC_QTY_PTS": 0,
					"SPOT_DEC_PRC_PTS": 4,
					"DERIV_MIN_QTY": 0.1,
					"DERIV_MAX_QTY": 1000,
					"DERIV_MIN_ORDER_VALUE": 10,
					"DERIV_MAX_ORDER_VALUE": 100000,
					"DERIV_DEC_QTY_PTS": 1,
					"DERIV_DEC_PRC_PTS": 4
				}
			},
			"TRXUSDT": {
				"IN": "USDT",
				"OUT": "TRON",
				"RULES": {
					"SYMBOL": "TRXUSDT",
					"NAME": "TRON",
					"MIN_QTY": 0.1,
					"MIN_QTY2": 0.1,
					"MAX_QTY": 1303392,
					"MIN_ORDER_VALUE": 10,
					"MAX_ORDER_VALUE": 1000000,
					"TICK_SIZE": 0.00001,
					"INITIAL_MARGIN_BASE_VALUE": 4,
					"MAINTENANCE_MARGIN_BASE_VALUE": 2,
					"DEC_PTS": 3,
					"DEC_PRC_PTS": 5,
					"SPOT_MIN_QTY": 0.1,
					"SPOT_MAX_QTY": 15138724.06641221,
					"SPOT_MIN_ORDER_VALUE": 10,
					"SPOT_MAX_ORDER_VALUE": 1000000,
					"SPOT_DEC_QTY_PTS": 1,
					"SPOT_DEC_PRC_PTS": 5,
					"DERIV_MIN_QTY": 1,
					"DERIV_MAX_QTY": 1000,
					"DERIV_MIN_ORDER_VALUE": 10,
					"DERIV_MAX_ORDER_VALUE": 100000,
					"DERIV_DEC_QTY_PTS": 0,
					"DERIV_DEC_PRC_PTS": 5
				}
			}
		}
	} catch (error) {
		throw new Error(`CryptoCompare request error: ${error.status}`);
	}
}



// Generate a symbol ID from a pair of the coins
export function generateSymbol(exchange, fromSymbol, toSymbol) {
	const short = `${fromSymbol}/${toSymbol}`;
	return {
		short,
		full: `${exchange}:${short}`,
	};
}

export function parseFullSymbol(fullSymbol) {
	const match = fullSymbol.match(/^(\w+):(\w+)\/(\w+)$/);
	if (!match) {
		return null;
	}

	return {
		exchange: match[1],
		fromSymbol: match[2],
		toSymbol: match[3],
	};
}

export async function makeApiRequestHistoryBinanceui(url, path) {
	const response = await fetch(`${url}/uiKlines?${path}`);
	return response.json()
}

export function getResolution(resolution){
	let data_interval = "1m";
	if (resolution == 1) {
		data_interval = "1m";
	} else if (resolution == 3) {
		data_interval = "3m";
	} else if (resolution == 5) {
		data_interval = "5m";
	} else if (resolution == 15) {
		data_interval = "15m";
	} else if (resolution == 30) {
		data_interval = "30m";
	} else if (resolution == 45) {
		data_interval = "45m";
	} else if (resolution == 60) {
		data_interval = "1h";
	} else if (resolution == 120) {
		data_interval = "2h";
	}else if (resolution == 240) {
		data_interval = "4h";
	}else if (resolution == "1D") {
		data_interval = "1d";
	}else if (resolution == "1W") {
		data_interval = "1w";
	}else if (resolution == "1M") {
		data_interval = "1M";
	}
	return data_interval;
}