const getNextWorkingDay = (date = new Date()) => {

  let nextDate = new Date(date);
  
  do {
      nextDate.setDate(nextDate.getDate() + 1);
  } while (nextDate.getDay() === 6 || nextDate.getDay() === 0); // 6 = Saturday, 0 = Sunday

  return nextDate;
}

function getRandomNumber(amount) {

  let max = amount * 0.03; // 2% of amount
  let min = -amount * 0.015; // 1% of amount (negative)

  return (Math.random() * (max - min)) + min;

}

const generate1Day = async (IPrice) => {

  const startTime = new Date();
  startTime.setHours(9, 15, 0, 0); // Start at 09:15:00
  const endTime = new Date();
  endTime.setHours(15, 30, 0, 0); // End at 15:30:00
  const interval = 5 * 60 * 1000; // 1 minute in milliseconds
  const data = [];

  var Price = IPrice ;

  for (let time = startTime; time <= endTime; time = new Date(time.getTime() + interval)) {
      
    data.push({ time: time.toLocaleTimeString('en-US', { hour12: true }), value: Price });

    var generatedNumber = getRandomNumber(Price);
    const randomNumber = generatedNumber * (2/75) 
    Price = Price + randomNumber
      
  }

  return data;
  
}

const generateLast5WorkingDays = async (IPrice) => {

  const workingDays = [];
  const today = new Date();
  today.setDate(today.getDate() - 1); // Start from yesterday

  var Price = IPrice ;

  while (workingDays.length < 5) {

      const day = today.getDay(); // Get the current day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)

      // Check if the day is Monday to Friday
      if (day >= 1 && day <= 5) {

          const day = String(new Date(today).getDate()).padStart(2, '0'); // Ensure 2-digit day
          const month = String(new Date(today).getMonth() + 1).padStart(2, '0'); // Ensure 2-digit month
          const year = new Date(today).getFullYear();

          workingDays.push({ time: `${day}/${month}/${year}`, value: Price }); // Add the current date to the result
          
          const randomNumber = getRandomNumber(Price)
          Price = Price - randomNumber

      }

      // Move to the previous day
      today.setDate(today.getDate() - 1);

  }

  return workingDays.reverse(); // Reverse the array to get dates in chronological order

};

const Get1M = async (IPrice) => {
    
  const end = new Date();
  const Month = end.getMonth(); 

  var daysInMonth ;

  if(Month == 2){
  
    if(end.getFullYear() % 4 === 0){
      daysInMonth = 29;
    }else{
      daysInMonth = 28;
    }
    
  }else{

    if(Month == 0 || Month == 1 || Month == 3 || Month == 5 || Month == 7 || Month == 8 || Month == 10){
      daysInMonth = 31;
    }else{
      daysInMonth = 30;
    }

  }

  var Price = IPrice ;

  const data = [];
  for (let i = 0; i < daysInMonth; i++) {
    
    const time = new Date(end);
    time.setDate(end.getDate() - i); 

    data.unshift({ time: time.toLocaleDateString(), value: Price });

    const randomNumber = getRandomNumber(Price)
    Price = Price - randomNumber

  }
  return data;

};

const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

const get1Y = async (IPrice) => {

  const end = new Date(); // Today's dates
  
  var year
  if(end.getMonth() < 2){
    year = end.getFullYear() - 1;
  }else{
    year = end.getFullYear();
  }

  var Price = IPrice ;

  const daysInYear = isLeapYear(year) ? 366 : 365; // Adjust days for leap year
  const data = [];

  for (let i = 0; i < daysInYear; i++) {

    const time = new Date(end);
    time.setDate(end.getDate() - i); // Subtract i days
    
    data.unshift({ time: time.toLocaleDateString(), value: Price });

    const randomNumber = getRandomNumber(Price)
    Price = Price - randomNumber
    
  }

  return data;

};

const convertToISO = async (dateStr, time = "12:25:01.555") => {
  // Split the input date
  const [day, month, year] = dateStr.split('/').map(Number);
  
  // Create a new Date object in UTC
  const date = new Date(Date.UTC(year, month - 1, day));

  // Extract the ISO date part
  const isoDatePart = date.toISOString().split("T")[0];

  // Construct the final format
  return `${isoDatePart}T${time}+00:00`;
}

module.exports = { generate1Day , generateLast5WorkingDays , Get1M , get1Y , convertToISO , getNextWorkingDay };
