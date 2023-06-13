import { i, mean, round, std, erf } from 'mathjs';
import { LegEntity } from 'src/entity/LegEntity';
import { OptData, OptHeader, OptLeg, WhatIf } from 'src/entity/OptData';

import bs from 'black-scholes';
import { Utility } from './Utility';
import { LegPL } from 'src/entity/LegPL';
import moment from 'moment';

export class PLCalc {

    static getSigma(expectedCost, s, k, t, r, callPut, estimate) {
        var iv = require("implied-volatility");
        return iv.getImpliedVolatility(expectedCost, s, k, t, r, callPut, estimate);
    }


    static GetEarliestExp(optlegs) {
        let mexpdt = '';

        optlegs.forEach(optleg => {
            if (mexpdt == "" || optleg.expdt < mexpdt) {
                mexpdt = optleg.expdt;
            }
        });

        return mexpdt;
    }

    static getMinMaxStrikes(optlegs: Array<OptLeg>) {

        let minstrike = Infinity;
        let maxstrike = 0.0;

        for (var optleg of optlegs) {
            if (optleg.pcflag == 'F') {
                if (optleg.entryPrice < minstrike)
                    minstrike = optleg.entryPrice;
            }


            if (optleg.entryPrice && optleg.entryPrice > maxstrike)
                maxstrike = optleg.entryPrice;
            else {
                if (optleg.strikePrice < minstrike)
                    minstrike = optleg.strikePrice;

                if (optleg.strikePrice > maxstrike)
                    maxstrike = optleg.strikePrice;
            }

        }

        return { "minstrike": minstrike, "maxstrike": maxstrike }
    }

    static isCurSymbol(symb) {
        let cursymbols = ['USDINR', 'EURINR', 'GBPINR', 'JPYINR', 'EURUSD', 'GBPUSD', 'USDJPY']

        return cursymbols.indexOf(symb) > -1;
    }

    static getCurLotsize(symb) {
        let lotsizemap = { 'USDINR': 1000, 'EURINR': 1000, 'GBPINR': 1000, 'JPYINR': 100000, 'EURUSD': 1000, 'GBPUSD': 1000, 'USDJPY': 100000 }
        return lotsizemap[symb];
    }

    static range(start, stop, step) {
        step = step || 1;
        let arr = [];
        for (let i = start; i < stop; i += step) {
            arr.push(i);
        }
        return arr;
    }

    static calcMean = (xAxisData) => {
        let sum = 0;
        xAxisData.forEach(element => {
            sum = sum + element;
        });

        if (sum != 0)
            return Math.round(sum / xAxisData.length);

        return null;
    }

    static ComputeDataForLeg(optheader, optleg, mexpdt, xstart, xend) {
        let S = optleg.futuresPrice;
        if (!S) {
            S = optheader.futuresPrice;
        }

        let isCur = this.isCurSymbol(optheader['symbol']);
        let MarketCloseTime = 17;
        let pdiff = 0.0025

        if (!isCur) {
            MarketCloseTime = 15.5;
            pdiff = Math.ceil(S * 0.00015)
        }
        console.log(optheader.dealDate)
        console.log(Date.parse(optleg.dealDate));

        // let cdt = Date.parse(optheader.dealDate);
        let dateFormat
        if(optheader.dealDate.indexOf("-")>0)
            dateFormat="YYYY-MM-DD, h:mm:ss a";
        else 
            dateFormat="MM/DD/YYYY, h:mm:ss a";
        let cdt = moment(optheader.dealDate, dateFormat).toDate().getTime();
        let expdt = Date.parse(optleg.expdt);

        let tsecs = (expdt - cdt) / 1000 + MarketCloseTime * 60 * 60;
        console.log(tsecs)
        if (tsecs == 0.0)
            tsecs = 60.0


        let day = Math.ceil(tsecs / (24.0 * 60.0 * 60.0));
        let T = day / 365;
        let PutCallFlag = optleg.pcflag;
        let X = optleg.strikePrice;
        let entryprice = optleg.exited == true ? optleg.exitPrice : optleg.entryPrice;
        let optionPrice = optleg.optionPrice;
        let tradetype = optleg.tradeType;
        let qty = optleg.qty;
        let v = optleg.iv / 100;

        let r = optheader.intrate;
        r = 0;

        if (PutCallFlag == 'C') {
            v = this.getSigma(optionPrice, S, X, T, 0, 'call', 0.1);
         }
        else if (PutCallFlag == 'P') {
            v = this.getSigma(optionPrice, S, X, T, 0, 'put', 0.1);
         }
console.log(xstart)
        let xdata = this.range(xstart, xend, pdiff / 4);

        // Compute Leg Data
        let curdata = []
        let expdata = []

        if (PutCallFlag == 'C') {
            for (var stkprice of xdata) {
                let strike = stkprice;
                 if (optleg.futuresPrice && optleg.expdt != optheader.payoffdate) {
                    strike = stkprice * ((parseFloat(optleg.futuresPrice)) / parseFloat(optheader.futuresPrice));
                    console.log(strike);
                }
                let p = bs.blackScholes(strike, X, T, v, r, "call");
    
                //T+0
                if (tradetype == 'B')
                    curdata.push((p - entryprice) * qty)
                else
                    curdata.push((entryprice - p) * qty)

                //  Expiry Data
                if (optleg["expdt"] === mexpdt) {
                    if (parseFloat(stkprice) <= parseFloat(X)) {
                        if (tradetype == 'B')
                            expdata.push(-(entryprice * qty));
                        else {
                            expdata.push(entryprice * qty);
                        }
                    } else {
                        if (tradetype == 'B') {
                            expdata.push(((stkprice - X) - entryprice) * qty);
                        }
                        else {
                            expdata.push((entryprice - (stkprice - X)) * qty);
                        }
                    }
                } else {
                    let strike = stkprice;
                    if (optleg.futuresPrice)
                        strike = stkprice * (parseFloat(optleg.futuresPrice) / parseFloat(optheader.futuresPrice));

                    p = bs.blackScholes(strike, X, T, v, r, "call");
                     if (tradetype == 'B') {
                        expdata.push((p - entryprice) * qty);
                    } else {
                        expdata.push((entryprice - p) * qty);
                    }
                }
            }

        } else if (PutCallFlag == 'P') {
            for (var stkprice of xdata) {
                let strike = stkprice;
                if (optleg.futuresPrice && optleg.expdt != optheader.payoffdate) {
                    strike = stkprice * ((parseFloat(optleg.futuresPrice)) / parseFloat(optheader.futuresPrice));
                }

                let p = bs.blackScholes(strike, X, T, v.toFixed(4), r, "put");

                if (tradetype == 'B') {
                    curdata.push((p - entryprice) * qty)
                }
                else {
                    curdata.push((entryprice - p) * qty)
                }


                if (optleg["expdt"] == mexpdt) {
                    if (stkprice >= X) {
                        if (tradetype == 'B')
                            expdata.push(-(entryprice * qty))
                        else {
                            expdata.push(entryprice * qty)
                        }

                    } else {
                        if (tradetype == 'B') {
                            expdata.push(((X - stkprice) - entryprice) * qty)
                        }
                        else {
                            expdata.push((entryprice - (X - stkprice)) * qty);
                        }

                    }
                } else {
                    p = bs.blackScholes(optleg.futuresPrice ? stkprice * (parseFloat(optleg.futuresPrice) / parseFloat(optheader.futuresPrice)) : stkprice, X, T, r, v, "put")
                    if (tradetype == 'B')
                        expdata.push((p - entryprice) * qty);
                    else
                        expdata.push((entryprice - p) * qty);
                }
            }
        }
        else {
            for (var stkprice of xdata) {
                if (tradetype == 'B') {
                    curdata.push((stkprice - entryprice) * qty)
                    expdata.push((stkprice - entryprice) * qty)
                } else {
                    curdata.push((entryprice - stkprice) * qty)
                    expdata.push((entryprice - stkprice) * qty)
                }
            }
        }
        return [xdata, curdata, expdata];
    }

    static ComputePayoffData(optdata: OptData) {
        let optheader = optdata.optheader;
        let optlegs = optdata.optlegs;
        let xdata = []
        let expdata = []
        let curdata = []
        let isCur = PLCalc.isCurSymbol(optheader.symbol);

        let MarketCloseTime = 17;
        let DivFactor = 0.0025;
        let pdiff = 0.25;

        if (!isCur) {
            MarketCloseTime = 15.5;
            DivFactor = 5.0
            pdiff = Math.ceil(+optheader.symbolPrice * 0.00015)
        }

        if (isCur) {
            let lotsize = PLCalc.getCurLotsize(optheader['symbol'])

            let size = optlegs.length;
            if (size > 0) {
                for (let i = 0; i < size; i++)
                    optlegs[i]['qty'] = optlegs[i]['qty'] * lotsize
            }
        }
        //  WHATIF ADJUSTMENTS
        if (optdata.whatif !== null) {
            if (optdata.whatif.price != 0 || optdata.whatif.days.toLocaleString() != new Date(optheader.dealDate).toLocaleDateString()) {
                // Adjust underlying price

                let optheader = optdata.optheader;
                if (optdata.whatif.price != 0) {
                    //    console.log(whatif.price)
                    optheader.symbolPrice = optheader.symbolPrice * (1 + (optdata.whatif.price / 100.0));;
                }

                if (optdata.whatif.IV != 0 && !optdata.whatif.allowLegAdjustment) {
                    //Adjust IV
                    optheader.avgiv = optheader.avgiv * (1 + optdata.whatif.IV / 100.0);;

                    let legs = optdata.optlegs;

                    legs.forEach(p => {
                        p.iv = p.iv * (1 + optdata.whatif.IV / 100.0);
                    })
                } else {
                    console.log(optdata.optlegs);
                }
                // if (whatif.days > 0) {
                // let dealDate= new Date(optheader.dealDate);
                // let newDate=dealDate.setDate(dealDate.getDate()+whatif.days);
                // optheader.dealDate = new Date(newDate).toLocaleDateString();
                optheader.dealDate = optdata.whatif.days?.toLocaleString();
            }
        }

        //  Get earliest expiry date
        let legsize = optlegs.length;
        let mexpdt = legsize > 0 ? PLCalc.GetEarliestExp(optlegs) : optheader.payoffdate;

        let mstrikes = PLCalc.getMinMaxStrikes(optlegs);

        // Compute SD and xstart/xend
        let S = optheader.symbolPrice;
        let avgiv = optheader.avgiv / 100.0;

        let expdt = mexpdt ? Utility.timeFromString(mexpdt) : null;//MarketCloseTime,"%Y-%m-%d %H:%M:%S")
        console.log(optheader.dealDate)
        // let dealdt = Date.parse(optheader.dealDate);

        let dateFormat
        if(optheader.dealDate.indexOf("-")>0)
            dateFormat="YYYY-MM-DD, h:mm:ss a";
        else 
            dateFormat="MM/DD/YYYY, h:mm:ss a";
        let dealdt = moment(optheader.dealDate, dateFormat).toDate().getTime();

console.log(expdt)
console.log(dealdt)
        let tsecs = (expdt - dealdt) / 1000 + MarketCloseTime * 60 * 60;
        let tdays = tsecs / (24.0 * 60.0 * 60.0);
        let T = tdays / 365.0;

        let sd = round(S * avgiv * Math.sqrt(T), 4);
        let p2sd = +S + (3.0 * +sd);
        let m2sd = +S - (3.0 * +sd);
     let mstart = Math.min(mstrikes['minstrike'], m2sd)
        let mend = Math.max(mstrikes['maxstrike'], p2sd)

        let xstart = isCur ? Math.floor((mstart * 0.998) / DivFactor) * DivFactor : Math.ceil((mstart * 0.97) / DivFactor) * DivFactor;
        let xend = isCur ? Math.ceil((mend * 1.002) / DivFactor) * DivFactor : Math.ceil((mend * 1.03) / DivFactor) * DivFactor
        // let legPLList = new Array<LegPL>();

        if (legsize == 0) {
            // # IF NO LEGS ARE PASSED, IT MEANS STRATEGY IS CLOSED. SEND DATA ARRAYS ACCORDINGLY
            p2sd = S + 2 * sd;
            m2sd = S - 2 * sd;
            if (isCur) {
                xstart = Math.floor((mstart * 0.998) / DivFactor) * DivFactor
                xend = Math.ceil((mend * 1.002) / DivFactor) * DivFactor
            } else {
                xstart = Math.ceil((mstart * 0.97) / DivFactor) * DivFactor
                xend = Math.ceil((mend * 1.03) / DivFactor) * DivFactor
            }

            //  Build data arrays
            xdata = PLCalc.range(xstart, xend, pdiff);
            curdata.push(...xdata);
            expdata.push(...xdata);
        } else {
            // Compute data for each leg and add up the P/Ls for each leg
         
            let firstleg = true;
            for (var optleg of optlegs) {

                let tdata = PLCalc.ComputeDataForLeg(optheader, optleg, mexpdt, xstart, xend);
                if (firstleg) {
                    let firstLegObj = tdata[0];
                    for (let j = 0; j < firstLegObj.length; j++)
                        xdata.push(tdata[0][j])
                }

                for (let l = 0; l < tdata[1].length; l++) {
                    if (firstleg)
                        curdata.push(Number.parseFloat(tdata[1][l]));
                    else {
                        if (optleg.exited != true)
                            curdata[l] += +Number.parseFloat(tdata[1][l]);
                    }

                }

                for (let k = 0; k < tdata[2].length; k++) {
                    if (firstleg)
                        expdata.push(Number.parseFloat(tdata[2][k]));
                    else
                        expdata[k] += +Number.parseFloat(tdata[2][k]);
                }

                if (firstleg)
                    firstleg = false;

            }

        }

        // try {
        //     let bpnl = optheader["bookedPNL"];

        //     if (bpnl != 0.0) {
        //         curdata = curdata.map(p => p + bpnl);
        //         expdata = expdata.map(p => p + bpnl);
        //     }

        // } catch {

        // }

        if (isCur)
            xdata = xdata.map(p => round(p, 4));
        else
            xdata = xdata.map(p => round(p, 2));

        curdata = curdata.map(p => round(p, 2));
        expdata = expdata.map(p => round(p, 2));

        return [xdata, curdata, expdata, { "sd": sd }]
        // return [xdata, curdata, expdata, { "sd": sd }, legPLList]
    }

    static chartData(data) {
        let optdata: OptData = new OptData();

        // assigning header
        let optheader = new OptHeader();
        optheader.avgiv = data.avgiv;
        optheader.symbol = data.selectedsymbol;
        optheader.symbolPrice = data.fairPrice;
        optheader.dealDate = new Date().toLocaleString();
        optheader.payoffdate = data.selectedExpiryDate;
        optheader.futuresPrice = data.futPrice;
        optdata.optheader = optheader;

        optdata.whatif = data.whatif;

        // assinging option legs
        let optlegs = new Array<OptLeg>();
        //need to take exited into consideration for T+0
        let legList = data.legEntityList;//.filter(p => !p.exited);
        for (let opt of legList) {
            let optleg: OptLeg = new OptLeg();
            optleg.optionPrice = Number.parseFloat((opt.Option_Price).toString().replace(',', ''));
            optleg.entryPrice = opt.Entry_Price == null ? optleg.optionPrice : Number.parseFloat((opt.Entry_Price).toString().replace(',', ''));
            if (opt.CE_PE == 'CE') {
                optleg.pcflag = 'C';
            } else if (opt.CE_PE == 'PE') {
                optleg.pcflag = 'P';
            } else {
                optleg.pcflag = 'F';
            }
            optleg.expdt = data.selectedExpiryDate;
            optleg.qty = opt.Position_Lot * data.lotSize;
            optleg.strikePrice = opt.Strike_Price;
            optleg.tradeType = opt.Buy_Sell;
            optleg.futuresPrice = data.futPrice;
            optleg.iv = opt.iv_adjustment ? opt.IV * (1 + opt.iv_adjustment / 100) : opt.IV;
            optleg.ivAdjustment = opt.iv_adjustment;
            optleg.exited = opt.exited;
            optleg.exitPrice = opt.Exit_Price;

            optlegs.push(optleg);
        }

        optdata.optlegs = optlegs;

        let result = PLCalc.ComputePayoffData(optdata);

        return result;
    };


    static findClosest(arrayData, fairPrice) {

        if (arrayData && arrayData.length > 0) {

            const closest = arrayData.reduce((a, b) => {
                return Math.abs(b - fairPrice) < Math.abs(a - fairPrice) ? b : a;
            });

            return closest;
        } else {
            return 0
        }
    }
}