import React, { useEffect, useRef, useState } from 'react';
import './index.css';
import { widget } from '../../charting_library';
import Datafeed from './datafeed.js';

function getLanguageFromURL() {
	const regex = new RegExp('[\\?&]lang=([^&#]*)');
	const results = regex.exec(window.location.search);
	return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

const TVChartContainer = ({ symbol, optionList, onCallback }) => {
	const chartContainerRef = useRef();

	let symbolString = symbol;
	let symbolStringCombined = "NIFTY";
	if (optionList.length > 0) {
		symbolStringCombined = "";
		optionList.forEach(p => {
			symbolStringCombined = symbolStringCombined + (symbolStringCombined != "" ? "|" : "") + symbolString + p.Strike_Price + p.CE_PE + p.Buy_Sell + p.Position_Lot;
		})
	}


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
			timezone: "Asia/Kolkata",
			fullscreen: false,
			autosize: true,
			loading_screen: null,
			debug: true,
			custom_formatters: {
				timeFormatter: {
					format: (date) => {
						const _format_str = '%h:%m';
						return _format_str
							.replace('%h', date.getUTCHours(), 2)
							.replace('%m', date.getUTCMinutes(), 2)
							.replace('%s', date.getUTCSeconds(), 2);
					}
				},
			},
			
		};

		const tvWidget = new widget(widgetOptions);

		tvWidget.onChartReady(() => {
		
			onCallback("return false");

			const items =sessionStorage.getItem("ichart_study_items");
			const itemsReturned = JSON.parse(items);
			console.log("itemsReturned",itemsReturned);
			itemsReturned.forEach(item=>{
				tvWidget.activeChart().createStudy(item, false, false, { length: 5 }, { 'Plot.color': 'rgb(150, 95, 196)' });
			})
		});


		tvWidget.subscribe('study', (event) => { 
			console.log(`A ${event.value} indicator was added`, event) 
			
			let items =[];
			let itemsReturned = sessionStorage.getItem("ichart_study_items");

			if(itemsReturned!==null){
			  	items.push(...JSON.parse(itemsReturned));
			}
			if (!items.includes(event.value)) {
				items.push(event.value);
			}
			sessionStorage.setItem("ichart_study_items", JSON.stringify(items));
		});

	});

	
	return (<>

		<div
			ref={chartContainerRef}
			className={'TVChartContainer'}
		/>
	</>

	);
}

export default React.memo(TVChartContainer);

