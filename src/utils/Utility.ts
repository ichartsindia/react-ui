import { OptionChain } from "../entity/OptionChain";

export class Utility {

    static yearElapse(dateString) {
        if (dateString == null) return null;
        let day = +dateString.substring(0, 2);
        let month = dateString.substring(2, 5);
        let year = +("20" + dateString.substring(5, 7));
        let monNumber = "JANFEBMARAPRMAYJUNJULAUGSEPOCTNOVDEC".indexOf(month) / 3;
        let date1 = new Date(year, monNumber, day).getTime();
        let date2 = (new Date()).getTime();
        const diffTime = Math.abs(date2 - date1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const diffYear = diffDays / 365;

        return diffYear;
    }

    static timeFromString(dateString) {
        const _MS_PER_DAY = 1000 * 60 * 60 * 24 * 365;
        let day = +dateString.substring(0, 2);
        let month = dateString.substring(2, 5);
        let year = +("20" + dateString.substring(5, 7));
        let monNumber = "JANFEBMARAPRMAYJUNJULAUGSEPOCTNOVDEC".indexOf(month) / 3;
        let date1 = new Date(year, monNumber, day).getTime();

        return date1;
    }

    static objectsEqual = (o1: OptionChain[], o2: OptionChain[]) => {
        if (o1.length != o2.length) {
            return false;
        }

        let isEqual = true;
        for (let i = 0; i < o1.length; i++) {
            let a1 = o1[i];
            let a2 = o2[i];

            Object.keys(a1).every((p) => {
                isEqual = a1[p] == a2[p]
                return isEqual;
            });
        }

        return isEqual;
    }

    static changeDateFormat = (dateStr) => {

        const regex = /^(\d{2})([A-Z]{3})(\d{2})$/;
        const match = regex.exec(dateStr);

        if (match) {
            const day = match[1];
            const month = match[2];
            const year = match[3];

            console.log('Day:', day);
            console.log('Month:', month);
            console.log('Year:', year);

            return `${year}${month}${day}`;
        } else {
            console.log('Date format does not match.');
            return null;
        }
    }
}