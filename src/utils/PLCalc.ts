import { round } from 'mathjs';
import { OptData, OptHeader, OptLeg, WhatIf } from 'src/entity/OptData';
import { DateUtility } from './DateUtility';
var bs = require("black-scholes");
export class PLCalc {
   
        static N(z) {
            const b1 =  0.31938153;
            const b2 = -0.356563782;
            const b3 =  1.781477937;
            const b4 = -1.821255978;
            const b5 =  1.330274429;
            const p  =  0.2316419;
            const c2 =  0.3989423;
            const a=Math.abs(z);
            if (a>6.0) {return 1.0;} 
            const t = 1.0/(1.0+a*p);
            const b = c2*Math.exp((-z)*(z/2.0));
            let n = ((((b5*t+b4)*t+b3)*t+b2)*t+b1)*t;
            n = 1.0-b*n;
            if (z < 0.0) {n = 1.0 - n;}
            return n;
          }  
    static getCallPrice(S, K, r, T, v) {
        let d1 = (Math.log(S / K) + (r + Math.pow(v, 2) / 2.0) * T) / (v * Math.sqrt(T));

        let nd1 = PLCalc.N(d1);

        let d2 = d1 - v * Math.sqrt(T);

        let nd2 = PLCalc.N(d2);

        return S * nd1 - K * Math.exp(-r * T) * nd2;
    }

    static getPutPrice(S, K, r, T, v) {
        let d1 = (Math.log(S / K) + (r + Math.pow(v, 2) / 2.0)) / (v*Math.sqrt(T));

        let nmd1 = PLCalc.N(-d1);

        let d2 = d1 - v * Math.sqrt(T);

        let nmd2 = PLCalc.N(-d2);

        return K * Math.exp(-r * T) * nmd2 - S * nmd1
    }

    static getImpliedVolatility(S, K, r, T, expectedCost, callPut: string) {
        let estimate = 0.1
        let low = 0
        let high = Infinity;
        let actualCost;

        for (let i = 0; i < 100; i++) {
            if (callPut.toLowerCase() == 'c') {
                actualCost = this.getCallPrice(S, K, r, T, estimate);
            } else {
                actualCost = this.getPutPrice(S, K, r, T, estimate);
            }

            if (expectedCost * 100 == Math.floor(actualCost * 100)) {
                continue;
            } else if (actualCost > expectedCost) {
                high = estimate;
                estimate = (estimate - low) / 2 + low;
            } else {
                low = estimate;
                estimate = (high - estimate) / 2 + estimate;
                if (Infinity == estimate) {
                    estimate = low * 2;
                }
            }
        }

        return estimate;
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
        var arr = [];
        for (var i = start; i < stop; i += step) {
            arr.push(i);
        }
        return arr;
    }

    static calcMean =(xAxisData)=>{
        let sum=0;
        xAxisData.forEach(element => {
            sum=sum+element;
        });

        if(sum!=0)
            return Math.round(sum/xAxisData.length);

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

        let cdt = Date.parse(optheader.dealDate);

        let expdt = Date.parse(optleg.expdt);

        let tsecs = (expdt - cdt) / 1000 + MarketCloseTime * 60 * 60;

        if (tsecs == 0.0)
            tsecs = 60.0

        let T = tsecs / (365.0 * 24.0 * 60.0 * 60.0);

        let PutCallFlag = optleg.pcflag;
        let X = optleg.strikePrice;
        let entryprice = optleg.entryPrice;
        let tradetype = optleg.tradeType;
        let qty = optleg.qty;
        let v = optleg.iv/100;
        let r = optheader.intrate;
r=0;
        // Build X-axis data
        let xdata = this.range(xstart, xend, pdiff);

        // Compute Leg Data
        let curdata = []
        let expdata = []

        if (PutCallFlag == 'C') {
            for (var stkprice of xdata) {
                let strike = stkprice;
                if (optleg.futuresPrice && optleg.expdt != optheader.payoffdate) {
                    strike = stkprice * ((Number.parseFloat(optleg.futuresPrice)) / Number.parseFloat(optheader.futuresPrice));
                }

                let p = bs.blackScholes(strike, X, T, v, r, "call")
                                   
                if (tradetype == 'B')
                    curdata.push((p - entryprice) * qty)
                else
                    curdata.push((entryprice - p) * qty)

                //  Expiry Data
                if (optleg["expdt"] == mexpdt) {
                    if (stkprice <= X) {
                        if (tradetype == 'B')
                            expdata.push(-(entryprice * qty));
                        else
                            expdata.push(entryprice * qty);
                    } else {
                        if (tradetype == 'B')
                            expdata.push(((stkprice - X) - entryprice) * qty);
                        else
                            expdata.push((entryprice - (stkprice - X)) * qty);
                    }
                   
                } else {
                    let expdt1 = Date.parse(optleg["expdt"]);
                    let dealdt1 = Date.parse(mexpdt);
                    let tsecs1 = (expdt1 - dealdt1) / 1000;
                    let T1 = tsecs1 / (365.0 * 24.0 * 60.0 * 60.0);

                    let strike = stkprice;
                    if (optleg.futuresPrice)
                        strike = stkprice * (Number.parseFloat(optleg.futuresPrice) / Number.parseFloat(optheader.futuresPrice));

                  //  p = PLCalc.getCallPrice(strike, X, r, T1, v);
                    p = bs.blackScholes(strike, X, T, v, r, "call")
                    if (tradetype == 'B')
                        expdata.push((p - entryprice) * qty);
                    else
                        expdata.push((entryprice - p) * qty);
                }
            }
          
        } else if (PutCallFlag == 'P') {
            let p;
            for (var stkprice of xdata) {
                if (optleg.futuresPrice && optleg.expdt != optheader.payoffdate)
                //    p = PLCalc.getPutPrice(stkprice * (Number.parseFloat(optleg.futuresPrice) / Number.parseFloat(optheader.futuresPrice)), X, r, T, v)
                    p = bs.blackScholes(stkprice * (Number.parseFloat(optleg.futuresPrice) / Number.parseFloat(optheader.futuresPrice)), X, T, v, r, "put")
                else
                   // p = PLCalc.getPutPrice(stkprice, X, r, T, v)
                 p = bs.blackScholes(stkprice, X, T, v, r, "put")

                if (tradetype == 'B')
                    curdata.push((p - entryprice) * qty)
                else
                    curdata.push((entryprice - p) * qty)

                if (optleg["expdt"] == mexpdt) {
                    if (stkprice >= X) {
                        if (tradetype == 'B')
                            expdata.push(-(entryprice * qty))
                        else
                            expdata.push(entryprice * qty)
                    } else {
                        if (tradetype == 'B')
                            expdata.push(((X - stkprice) - entryprice) * qty)
                        else
                            expdata.push((entryprice - (X - stkprice)) * qty)
                    }
                } else {
                    let expdt1 = Date.parse(optleg.expdt);
                    let dealdt1 = Date.parse(mexpdt);
                    let tsecs1 = (expdt1 - dealdt1) / 1000;
                    let T1 = tsecs1 / (365.0 * 24.0 * 60.0 * 60.0);

                    p = PLCalc.getPutPrice(optleg.futuresPrice ? stkprice * (Number.parseFloat(optleg.futuresPrice) / Number.parseFloat(optheader.futuresPrice)) : stkprice, X, r, T1, v)

                    if (tradetype == 'B')
                        expdata.push((p - entryprice) * qty);
                    else
                        expdata.push((entryprice - p) * qty);
                }
            }
        }
       
        return [xdata,curdata,expdata];
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

        try{
            let whatif=optdata.whatif;

            if(whatif.price!=0 || whatif.IV!=0 || whatif.days>0){
                // Adjust underlying price
			
                let optheader = optdata.optheader;
                if(whatif.price!=0){
    				optheader.symbolPrice = optheader.symbolPrice*(1 + (whatif.price/100.0));;         
                }

                if(whatif.IV!=0){
                    //Adjust IV
                   optheader.avgiv=optheader.avgiv*(1+whatif.IV/100.0);;

                    let legs = optdata.optlegs;

                    legs.forEach(p=>{
                        p.iv=p.iv*(1+whatif.IV/100.0);
                    })
                }

                if(whatif.days>0){
                    optheader.dealDate= ((new Date(optheader.dealDate)).getDate()+whatif.days).toLocaleString();
                    console.log(optheader.dealDate);
                }
            }    

        } catch (e){
            console.log(e)
        }
        //  Get earliest expiry date
        let legsize = optlegs.length;
        let mexpdt = legsize > 0 ? PLCalc.GetEarliestExp(optlegs) : optheader.payoffdate;

        let mstrikes = PLCalc.getMinMaxStrikes(optlegs);

        // Compute SD and xstart/xend
        let S = optheader.symbolPrice;
        let avgiv = optheader.avgiv/100.0;

        let expdt =mexpdt? DateUtility.timeFromString(mexpdt):null;//MarketCloseTime,"%Y-%m-%d %H:%M:%S")
        let dealdt = Date.parse(optheader.dealDate);

        let tsecs = (expdt - dealdt) / 1000 + MarketCloseTime * 60 * 60;
        let tdays = tsecs / (24.0 * 60.0 * 60.0);
        console.log(tdays)
        let T = tdays / 365.0;
    
        let sd = round(S * avgiv * Math.sqrt(T), 4);
        let p2sd = +S + (3.0 * +sd);
        let m2sd = +S - (3.0 * +sd);
 
        console.log(m2sd,p2sd)
        let mstart = Math.min(mstrikes['minstrike'], m2sd)
        let mend = Math.max(mstrikes['maxstrike'], p2sd)


        let xstart = isCur ? Math.floor((mstart * 0.998) / DivFactor) * DivFactor : Math.ceil((mstart * 0.97) / DivFactor) * DivFactor;
        let xend = isCur ? Math.ceil((mend * 1.002) / DivFactor) * DivFactor : Math.ceil((mend * 1.03) / DivFactor) * DivFactor


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


                for (let j = 0; j < tdata[1].length; j++) {
                    if (firstleg)
                        curdata.push(tdata[1][j]);
                    else
                        curdata[j] += tdata[1][j];
                }

                for (let k = 0; k < tdata[2].length; k++) {
                    if (firstleg)
                        expdata.push(tdata[2][k]);
                    else
                    expdata[k] += tdata[2][k];
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

        return [xdata, curdata, expdata]
    }
 
}

