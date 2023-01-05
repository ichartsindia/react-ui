import React from "react";
import { OptionChain } from "src/entity/OptionChain";
import { StockSymbol } from "src/entity/StockSymbol";

interface Props {
    strategyEntityList: OptionChain[],
    symbol: StockSymbol
}

interface State {
    strategyEntityList: OptionChain[]
}

export class StrategyCalculation extends React.Component<Props, State> {
    constructor(props) {
        super(props);

        this.state={
            strategyEntityList:[]
        }
    }

    render() {
        return (
            <div className="flex" >
                    <div className='flex flex-space-between'>
                        <div>Max Profit</div>
                        <div>{this.maxProfit()}</div>
                    </div>
                    <div className='flex flex-space-between'>
                        <div>Max Loss</div>
                        <div>{this.maxLoss()}</div>
                    </div>
                    <div className='flex flex-space-between'>
                        <div>Break Even</div>
                        <div>100</div>
                    </div>
                    <div className='flex flex-space-between'>
                        <div>RR</div>
                        <div>200</div>
                    </div>
                    <div className='flex flex-space-between'>
                        <div>Net Profit</div>
                        <div>400</div>
                    </div>
                    <div className='flex flex-space-between'>
                        <div>Estimate Margin</div>
                        <div>300</div>
                    </div>
                    <div className='flex flex-space-between'>
                        <div>Total P&L</div>
                        <div>200</div>
                    </div>
                </div>
        )
    }

    maxProfit = () => {
        let strategyEntityList = this.state.strategyEntityList;

        let buyCallList = strategyEntityList.filter(p => p.Buy_Call && p.Buy_Call == true);
        let sellCallList = strategyEntityList.filter(p => p.Sell_Call && p.Sell_Call == true);
        if (buyCallList.length > 0 && sellCallList.length == 0) {
            return "Unlimited";
        }

        let buyPutList = strategyEntityList.filter(p => p.Buy_Put && p.Buy_Put == true);
        let sellPutList = strategyEntityList.filter(p => p.Sell_Put && p.Sell_Put == true);
        if (buyPutList.length > 0 && sellPutList.length == 0) {
            return "Unlimited";
        }


        return 100;
    }

    maxLoss = () => {
        let strategyEntityList = this.state.strategyEntityList;
        let sellCallList = strategyEntityList.filter(p => p.Sell_Call == true);
        let buyCallList = strategyEntityList.filter(p => p.Buy_Call == true);
        if (sellCallList.length > 0 && buyCallList.length == 0) {
            return "Unlimited";
        }

        let sellPutList = strategyEntityList.filter(p => p.Sell_Put == true);
        let buyPutList = strategyEntityList.filter(p => p.Buy_Put == true);
        if (sellPutList.length > 0 && buyPutList.length == 0) {
            return "Unlimited";
        }

        return 100;
    }
}