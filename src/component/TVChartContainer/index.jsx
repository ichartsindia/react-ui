import React, { useEffect, useRef } from 'react';
import './index.css';
import { widget } from '../../charting_library';
import Datafeed from './datafeed.js';

function getLanguageFromURL() {
	const regex = new RegExp('[\\?&]lang=([^&#]*)');
	const results = regex.exec(window.location.search);
	return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

export const TVChartContainer = (symbol,optionList) => {
	const chartContainerRef = useRef();
console.log(symbol);
let symbolString=symbol.symbol;
let symbolStringCombined="NIFTY";
	if(symbol.optionList.length>0){
		symbolStringCombined="";
		symbol.optionList.forEach(p=>{
			console.log("before",symbolStringCombined);
			symbolStringCombined=symbolStringCombined + (symbolStringCombined!=""?"|":"")+symbolString + p.Strike_Price+p.CE_PE+p.Buy_Sell+p.Position_Lot;
			console.log("after",symbolStringCombined);
		})
	}

	console.log(symbolStringCombined);
	useEffect(() => {
		const widgetOptions = {
			symbol: symbolStringCombined,
			// BEWARE: no trailing slash is expected in feed URL
			datafeed: Datafeed,
			interval: '1',
			container: chartContainerRef.current,
			library_path: '/charting_library/',
			locale: getLanguageFromURL() || 'en',
			disabled_features: ['use_localstorage_for_settings'],
			enabled_features: ['study_templates'],
			charts_storage_url: 'https://saveload.tradingview.com',
			charts_storage_api_version: '1.1',
			client_id: 'icharts.in',
			user_id: 'public_user_id',
			fullscreen:false,
			autosize: true,
		};

		const tvWidget = new widget(widgetOptions);

		tvWidget.onChartReady(() => {
			tvWidget.headerReady().then(() => {
				
			});
		});

		return () => {
			tvWidget.remove();
		};
	});
	
	
	
	  return (
		<div
			ref={chartContainerRef}
			className={'TVChartContainer'}
		/>
	);
}
