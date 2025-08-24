export const formatNumberValue = (num: string ): string => {
    // console.log('en formatNumberValue',num)
    if (!num) return "";
    
    //const numericValue = num.replace(/[^0-9,]/g, "").replace(",", ".");
    const numericValue = num.replace(/[^0-9,]/g, "");
    let [integerPart, decimalPart] = numericValue.split(".");
   //return useDecimals && formattedDecimal !== "" ? `${integerPart},${formattedDecimal}` : integerPart;
   integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
   return  `${integerPart}` ;
   // const formattedDecimal = decimalPart ? decimalPart.slice(0, 2) : ""; // 🔹 Limita a 2 decimales
}