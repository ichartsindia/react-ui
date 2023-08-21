import React, { useRef } from 'react';
import './index.css';
import Datafeed from './api/';
import {
  widget,
  ChartingLibraryWidgetOptions,
  LanguageCode,
  ResolutionString,
} from '../../charting_library';


const getLanguageFromURL = (): LanguageCode | null => {
	const regex = new RegExp('[\\?&]lang=([^&#]*)');
	const results = regex.exec(location.search);
	return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' ')) as LanguageCode;
};


export interface ChartContainerProps {
  symbol: ChartingLibraryWidgetOptions['symbol'];
  interval: ChartingLibraryWidgetOptions['interval'];
  datafeedUrl: string;
  libraryPath: ChartingLibraryWidgetOptions['library_path'];
  chartsStorageUrl: ChartingLibraryWidgetOptions['charts_storage_url'];
  chartsStorageApiVersion: ChartingLibraryWidgetOptions['charts_storage_api_version'];
  clientId: ChartingLibraryWidgetOptions['client_id'];
  userId: ChartingLibraryWidgetOptions['user_id'];
  fullscreen: ChartingLibraryWidgetOptions['fullscreen'];
  autosize: ChartingLibraryWidgetOptions['autosize'];
  studiesOverrides: ChartingLibraryWidgetOptions['studies_overrides'];
  container: ChartingLibraryWidgetOptions['container'];
}

class TVChartContainer extends React.PureComponent<ChartContainerProps> {
	chartContainerRef = React.createRef<HTMLDivElement>();

  static defaultProps: Partial<ChartContainerProps> = {
    symbol: 'Coinbase:BTC/USD',
    interval: 'D' as ResolutionString,
    // datafeedUrl: 'https://demo_feed.tradingview.com',
    libraryPath: '/charting_library/',
    chartsStorageUrl: 'https://saveload.tradingview.com',
    chartsStorageApiVersion: '1.1',
    clientId: 'tradingview.com',
    userId: 'public_user_id',
    fullscreen: false,
    autosize: true,
    studiesOverrides: {},
  };

  componentDidMount() {
    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol: this.props.symbol as string,
      datafeed: Datafeed,
      interval: this.props.interval as ChartingLibraryWidgetOptions['interval'],
      container: this.chartContainerRef.current!,
      library_path: this.props.libraryPath as string,
      locale: getLanguageFromURL() || 'en',
      disabled_features: ['use_localstorage_for_settings'],
      enabled_features: ['study_templates'],
      charts_storage_url: this.props.chartsStorageUrl,
      charts_storage_api_version: this.props.chartsStorageApiVersion,
      client_id: this.props.clientId,
      user_id: this.props.userId,
      fullscreen: this.props.fullscreen,
      autosize: this.props.autosize,
      studies_overrides: this.props.studiesOverrides,
    };

    const tvWidget = new widget(widgetOptions);

    tvWidget.onChartReady(() => {
      console.log('Chart has loaded!');
    });
  }

  render() {
    return (
      <div
        ref={this.chartContainerRef}
        className={'TVChartContainer'}
      />
    );
  }
}

export default TVChartContainer;
