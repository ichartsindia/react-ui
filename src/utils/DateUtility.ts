export class DateUtility {

    static yearElapse(dateString) {
        if(dateString==null) return null;
        const _MS_PER_DAY = 1000 * 60 * 60 * 24 * 365;
        let day = +dateString.substring(0, 2);
        let month = dateString.substring(2, 5);
        let year = +("20" + dateString.substring(5, 7));
        let monNumber = "JANFEBMARAPRMAYJUNJULAUGSEPOCTNOVDEC".indexOf(month) / 3;
        let date1 = new Date(year, monNumber, day).getTime();
        let date2 = (new Date()).getTime();
        const diffTime = Math.abs(date2 - date1);
        const diffYear = diffTime / _MS_PER_DAY;

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
}