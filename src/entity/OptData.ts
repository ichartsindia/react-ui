export class OptData{
    optheader: OptHeader;
    whatif: WhatIf;
    optlegs: Array<OptLeg>;
}

export class OptHeader{
    symbol: string;
    payoffdate: string;
    dealDate: string;
    symbolPrice: number;
    avgiv:number; 
    intrate:number
    bookedPNL:number; 
    futuresPrice:number;
}

export class OptLeg{
    futuresPrice:number;
    expdt:string;
    pcflag: string;
    strikePrice:number;
    entryPrice:number;
    tradeType:string;
    qty:number;
    iv:number;
}

export class WhatIf{
    price:number;
    IV:number;
    days:number;

}