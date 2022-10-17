export class OptionChain{
    Call_Ask: number;
    Call_Bid:number;
    Call_Delta:number;
    Call_IV:number;
    Call_LTP:number;
    Put_Ask:number;
    Put_Bid:number;
    Put_Delta:number;
    Put_IV:number;
    Put_LTP:number;
    Strike_Price:number;

    Buy_Call:boolean;
    Sell_Call:boolean;
    Buy_Put:boolean;
    Sell_Put:boolean;

    Option_Price:number;
    Expiry_Date: Date;

    Put_Lot:number;
    Call_Lot:number;
}