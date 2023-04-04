/* eslint-disable */
import { parseFullSymbol, getResolution } from './helpers.js';
var ws;

const SOCKETURL='wss://stream.binance.com/stream';
const channelToSubscription = new Map();


const TEMP_FROM_BINANCE = true;

// Socket for Binance Data
const InitializeBinanceData = (symbol, time) => {
	console.log("symbol",symbol)
	console.log("time",time)
	symbol = symbol == 'TRONUSDT' ? 'TRXUSDT' : symbol;
    ws = new WebSocket(SOCKETURL);
	ws.addEventListener('open', function () {
		ws.send(JSON.stringify({
			method: "SUBSCRIBE",
			params: [symbol.toLowerCase() + `@kline_${time}`/*, symbol.toLowerCase() + "@aggTrade"*/],
			id: 1,
		}));
	});

	ws.addEventListener('message', function (event) {
		

		const eventTypeStr = 0;
		const exchange = 'Tradable_Exchange';
		const chartData = JSON.parse(event.data);


		if (chartData.data && chartData.data.e == 'kline') {

			let k = chartData?.data.k;
			const tradeTimeStr = k.t;
			const tradePriceStr = Number(k.c);
			const volumeStr = Number(k.v)

			if (parseInt(eventTypeStr) !== 0) {
				// skip all non-TRADE events
				return;
			}
			const tradePrice = parseFloat(tradePriceStr);
			const tradeTime = parseInt(tradeTimeStr);
			const volume = parseInt(volumeStr)

			let pair = chartData?.data?.s
			if (TEMP_FROM_BINANCE) {
				pair = chartData?.data?.s == 'TRXUSDT' ? 'TRONUSDT' : chartData?.data?.s;
			}
			const channelString = `0~${exchange}~${pair}~${chartData?.data?.k?.i}`;
			const subscriptionItem = channelToSubscription.get(channelString);

			if (subscriptionItem === undefined) {
				return;
			}
			const lastDailyBar = subscriptionItem.lastDailyBar;
			const nextDailyBarTime = getNextDailyBarTime(lastDailyBar?.time);

			let bar;
			if (tradeTime >= nextDailyBarTime || !lastDailyBar) {
				bar = {
					time: !lastDailyBar ? tradeTime : nextDailyBarTime,
					open: tradePrice,
					high: tradePrice,
					low: tradePrice,
					close: tradePrice,
					volume: volume
				};
			} else {
				bar = {
					...lastDailyBar,
					high: Math.max(lastDailyBar.high, tradePrice),
					low: Math.min(lastDailyBar.low, tradePrice),
					close: tradePrice,
				};
			}

			subscriptionItem.lastDailyBar = bar;

			// send data to every subscriber of that symbol
			subscriptionItem.handlers.forEach(handler => handler.callback(bar));
		} else if (chartData.data && chartData.data.e == 'aggTrade') {
			gir

			let pair = chartData?.data?.s
			if (TEMP_FROM_BINANCE) {
				pair = chartData?.data?.s == 'TRXUSDT' ? 'TRONUSDT' : chartData?.data?.s;
			}
			const channelString = `0~${exchange}~${pair}~${chartData?.data?.k?.i}`;
			const subscriptionItem = channelToSubscription.get(channelString);
			if (subscriptionItem === undefined) {
				return;
			}
			const lastDailyBar = subscriptionItem.lastDailyBar;


			let bar = {
				...lastDailyBar,
				// high: Math.max(lastDailyBar.high, tradePrice),
				// low: Math.min(lastDailyBar.low, tradePrice),
				close: chartData.data.p,
			};
			subscriptionItem.lastDailyBar = bar;
			subscriptionItem.handlers.forEach(handler => handler.callback(bar));

		}

	});
	return () => {
		ws.addEventListener("close", function () {
			ws.send(JSON.stringify({
				method: "SUBSCRIBE",
				params: [symbol.toLowerCase() + `@kline_${time}`],
				id: 1,
			}))
		})
	}

}

function getNextDailyBarTime(barTime) {
	const date = new Date(barTime * 1000);
	date.setDate(date.getDate() + 1);
	return date.getTime() / 1000;
}


export function subscribeOnStream(
	symbolInfo,
	resolution,
	onRealtimeCallback,
	subscribeUID,
	onResetCacheNeededCallback,
	lastDailyBar,
) {

	const parsedSymbol = parseFullSymbol(symbolInfo.full_name);

	let symbol = parsedSymbol?.fromSymbol + parsedSymbol?.toSymbol;

	let data_interval = getResolution(resolution)
	const channelString = `0~${parsedSymbol.exchange}~${parsedSymbol.fromSymbol}${parsedSymbol.toSymbol}~${data_interval}`;
	const handler = {
		id: subscribeUID,
		callback: onRealtimeCallback,
	};
	let subscriptionItem = channelToSubscription.get(channelString);
	let nsymbol = symbol == 'TRONUSDT' ? 'TRXUSDT' : symbol;
	// socket.emit('SubAdd', { subs: [channelString] });
	if (!TEMP_FROM_BINANCE) {
		console.log("!temp from binance")
		symbol && initAllSocket('join_kline', { symbol })
	} else {
		console.log("Binance")
		InitializeBinanceData(symbol, data_interval)
	}
	if (subscriptionItem) {
		subscriptionItem.handlers.push(handler);
		return;
	}
	subscriptionItem = {
		subscribeUID,
		resolution,
		nsymbol,
		data_interval,
		lastDailyBar,
		handlers: [handler],
	};
	channelToSubscription.set(channelString, subscriptionItem);


}


export function unsubscribeFromStream(subscriberUID) {
	// find a subscription with id === subscriberUID
	for (const channelString of channelToSubscription.keys()) {
		const subscriptionItem = channelToSubscription.get(channelString);
		const handlerIndex = subscriptionItem.handlers
			.findIndex(handler => handler.id === subscriberUID);

		if (handlerIndex !== -1) {
			// remove from handlers
			subscriptionItem.handlers.splice(handlerIndex, 1);

			if (subscriptionItem.handlers.length === 0) {
				ws.send(JSON.stringify({
					method: "UNSUBSCRIBE",
					params: [subscriptionItem.nsymbol.toLowerCase() + `@kline_${subscriptionItem.data_interval}`],
					id: 1,
				}));
				channelToSubscription.delete(channelString);
				break;
			}
		}
	}
}
