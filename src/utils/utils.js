export const parseDate = unixTS => {
    if(unixTS == null || unixTS == 0){
        return ''
    }
    let d = new Date(unixTS),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

export const round = (val) => {
    return Math.round(val)
 }

export const format = (val) => {
    return Number(round(val)).toLocaleString('fr')
 }