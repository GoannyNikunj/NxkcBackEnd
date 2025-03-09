var {
  Users , 
  Records ,
  Share
} = require("../model/Schema");

const randomValue = () => {
  return Math.floor(Math.random() * (8100000 - 7500000 + 1) + 7500000)
};

const generate1D = async (_id) => {

  const startTime = new Date();
  startTime.setHours(9, 15, 0, 0); // Start at 09:15:00
  const endTime = new Date();
  endTime.setHours(15, 30, 0, 0); // End at 15:30:00
  const interval = 60 * 1000; // 1 minute in milliseconds
  const data = [];

  const Record = await Share.findOne({
    _id: _id,
  });

  for (let time = startTime; time < endTime; time = new Date(time.getTime() + interval)) {
    data.push({ time: time.toLocaleTimeString('en-US', { hour12: true }), value: Record.Price });
  }

  return data;
};

const getLast5WorkingDays = async (_id) => {
    const workingDays = [];
    const today = new Date();
    today.setDate(today.getDate() - 1); // Start from yesterday

    while (workingDays.length < 5) {

        const day = today.getDay(); // Get the current day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)

        // Check if the day is Monday to Friday
        if (day >= 1 && day <= 5) {

            const day = String(new Date(today).getDate()).padStart(2, '0'); // Ensure 2-digit day
            const month = String(new Date(today).getMonth() + 1).padStart(2, '0'); // Ensure 2-digit month
            const year = new Date(today).getFullYear();

            const Record = await Records.find({
              Time: `${day}/${month}/${year}`,
            });

            const AllRecord = await Records.find();

            if(AllRecord.length == 10){

              let data = new Records({
                Time: "23/02/2025",
                Value: "7561378",
              });
    
              await data.save();

              workingDays.push({ time: `${day}/${month}/${year}`, value: Record[0].Value }); // Add the current date to the result
            }else{

              await Records.find({ Time: "23/02/2025" }).deleteOne();

              workingDays.push({ time: `${day}/${month}/${year}`, value: Record[1].Value }); // Add the current date to the result
            }
            
        }

        // Move to the previous day
        today.setDate(today.getDate() - 1);

    }

    return workingDays.reverse(); // Reverse the array to get dates in chronological order

};

const generate1M = async (_id) => {
    
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

    const data = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const time = new Date(end);
      time.setDate(end.getDate() - i); 
      data.unshift({ time: time.toLocaleDateString(), value: randomValue() });
    }
    return data;

};

const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

const generate1Y = async (_id) => {
    const end = new Date(); // Today's dates
    
    var year
    if(end.getMonth() < 2){
      year = end.getFullYear() - 1;
    }else{
      year = end.getFullYear();
    }

    const daysInYear = isLeapYear(year) ? 366 : 365; // Adjust days for leap year
    const data = [];
    for (let i = 1; i <= daysInYear; i++) {
      const time = new Date(end);
      time.setDate(end.getDate() - i); // Subtract i days
      data.unshift({ time: time.toLocaleDateString(), value: randomValue() });
    }
    return data;
};

module.exports = (io) => {
  const handleNamespace = (namespace, generateData) => {
    io.of(namespace).on("connection", (socket) => {

      const emitData = async (_id) => {
        const data = await generateData(_id);
        socket.emit("updateChartData", data);
      };

      const intervalId = setInterval(emitData, 300000); 

      socket.on("sendId", ({ _id }) => {

        emitData(_id);

        console.log(`User2 connected to ${namespace}:`, _id, socket.id);

      });
      socket.on("disconnect", () => {
        clearInterval(intervalId);
        console.log(`User disconnected from ${namespace}:`, socket.id);
      });

    });
  };

  handleNamespace("/1D", generate1D);
  handleNamespace("/5D", getLast5WorkingDays);
  handleNamespace("/1M", generate1M);
  handleNamespace("/1Y", generate1Y);
};