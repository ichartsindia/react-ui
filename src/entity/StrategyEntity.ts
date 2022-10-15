export class StrategyEntity{
    id:string;
    strike:number;
    callLots:number;
    callLTP:number;
    callBuy:boolean;
    callSell:boolean;
    putLots:number;
    putLTP:number;
    putBuy:boolean;
    putSell:boolean;
    expiryDate: Date;
    optionPrice:number;
    IV: number;
}