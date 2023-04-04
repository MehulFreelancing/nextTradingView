import * as React from "react";
import { widget } from "../charting_library";
import Datafeed from "../datafeed";
function getLanguageFromURL() {
  const regex = new RegExp("[\\?&]lang=([^&#]*)");
  const results = regex.exec(window.location.search);
  return results === null
    ? null
    : decodeURIComponent(results[1].replace(/\+/g, " "));
}

//TODo-: To change the color of candle set color in upColor and downColor And Uncomment Line No 63-68

// let upColor = "#d24f45";
// let downColor = "#1261c4";

let timezone_name = Intl.DateTimeFormat().resolvedOptions().timeZone;
if (timezone_name == "Asia/Calcutta") {
  timezone_name = "Asia/Kolkata";
}
export class TVChartContainer extends React.PureComponent {
  static defaultProps = {
    interval: "60",
    datafeedUrl: Datafeed,
    libraryPath: "/charting_library/",
    chartsStorageUrl: "https://saveload.tradingview.com",
    chartsStorageApiVersion: "1.1",
    clientId: "tradingview.com",
    userId: "public_user_id",
    fullscreen: true,
    disableBeautification: false,
    autosize: true,
    studiesOverrides: {},
    timezone: timezone_name,
  };

  tvWidget = null;

  constructor(props) {
    super(props);
    this.state = { symbol: props.data, theme: props.theme };
    this.ref = React.createRef();
  }

  chartData(theme) {
    const widgetOptions = {
      pricescale: 10,
      time_frames: [],
      time_scale: { min_bar_spacing: 1},
      symbol: `${'Tradable_Exchange'}:${this.state.symbol}`,
      // BEWARE: no trailing slash is expected in feed URL
      datafeed: Datafeed,
      interval: this.props.interval,
      container: this.ref.current,
      library_path: this.props.libraryPath,

      locale: getLanguageFromURL() || "en",
      disabled_features: ["use_localstorage_for_settings"],
      client_id: this.props.clientId,
      user_id: this.props.userId,
      fullscreen: this.props.fullscreen,
      autosize: this.props.autosize,
      theme: theme,
      timezone: this.props.timezone,
      overrides: {
        // "mainSeriesProperties.candleStyle.upColor": upColor,     
        // "mainSeriesProperties.candleStyle.downColor": downColor,
        // "mainSeriesProperties.candleStyle.borderUpColor": upColor,
        // "mainSeriesProperties.candleStyle.borderDownColor": downColor,
        // "mainSeriesProperties.candleStyle.wickUpColor": upColor,
        // "mainSeriesProperties.candleStyle.wickDownColor": downColor,


        // "paneProperties.background": "#ff99ff",    //Uncomment this line and set Background color


        // If you want to set background color Gradient
        // 'paneProperties.backgroundType':'gradient',
        // 'paneProperties.backgroundGradientStartColor':"#ffcc00",
        // 'paneProperties.backgroundGradientEndColor':'#33cc33'


        

      },

      // toolbar_bg:'#33cc33',   //lefttoolBar color change
      


      
      
    };

    const tvWidget = new widget(widgetOptions);
    this.tvWidget = tvWidget;

    tvWidget.onChartReady(() => {
      tvWidget.headerReady().then(() => {
      });
    });
  }

  componentDidMount() {
    this.chartData(this.state.theme);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.theme !== this.props.them) {
      this.setState({
        theme: this.props.theme,
      });
    }
    this.chartData(this.state.theme);
  }

  componentWillUnmount() {
    if (this.tvWidget !== null) {
      this.tvWidget.remove();
      this.tvWidget = null;
    }
  }

  render() {
    return <div ref={this.ref} className={"TVChartContainer"} />;
  }
}
