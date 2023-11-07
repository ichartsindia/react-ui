export async function makeApiRequest(path) {
    try {
        const response = await fetch(path);
        return response.json();
    } catch(error) {
        throw new Error(`CryptoCompare request error: ${error.status}`);
    }
}
// Generates a symbol ID from a pair of the coins
export function generateSymbol(exchange, fromSymbol, toSymbol) {
    const short = `${fromSymbol}/${toSymbol}`;
    return {
        short,
        full: `${exchange}:${short}`,
    };
}

// Returns all parts of the symbol
export function parseFullSymbol(fullSymbol) {
    const match = fullSymbol.match(/^(\w+):(\w+)\/(\w+)$/);
    if (!match) {
        return null;
    }
    return { exchange: match[1], fromSymbol: match[2], toSymbol: match[3] };
}


export function parseSymbol(fullSymbol){
    const pattern = /^([A-Z]+\d+[A-Z]+\d+\d+[A-Z]+E)/;
   
        const match = fullSymbol.match(pattern);
        if (match) {
            const result = match[1];
      //      console.log("result",result);
         return result;
           } else {
            // console.log("No match found.");
          }
    return null;
}

export function parseBuyOrSell(fullSymbol){
    return fullSymbol.charAt(fullSymbol.length - 2);
}

export function parseLot(fullSymbol){
    return   parseInt(fullSymbol.charAt(fullSymbol.length - 1));
}

// Returns all parts of the symbol
export function parseTickerName(fullSymbol) {
    const match = fullSymbol.match(/^([A-Z]+\d{2}[A-Z]+\d{2})/);
    if (!match) {
        return null;
    }
    return match[1];
}

export function findIntersect (jsonObj1, jsonObj2 ){
  
    const times1 = jsonObj1.map((item) => item.time);
    const times2 = jsonObj2.map((item) => item.time);

    // Find the intersection of the time values
    const commonTimes = times1.filter((time) => times2.includes(time));

    // Filter the original JSON objects to retain only common time values
    // const resultObj1 = jsonObj1.filter((item) => commonTimes.includes(item.time));
    // const resultObj2 = jsonObj2.filter((item) => commonTimes.includes(item.time));

    // Convert the result back to JSON
    // const resultJsonObj1 = JSON.stringify(resultObj1, null, 2);
    // const resultJsonObj2 = JSON.stringify(resultObj2, null, 2);

    return commonTimes;
}
export function millisecondsToDate(milliseconds) {
  const date = new Date(milliseconds);
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // Months are 0-based, so add 1
  const day = date.getDate();


  // Create a formatted date string
  const formattedDate = `${year}-${month}-${day}`;

  return formattedDate;
}

