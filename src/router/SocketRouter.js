var { User , PurchaseShare , Share } = require("../model/Schema");

const generate1D = async (_id) => {

  const Record = await Share.findOne({
    _id: _id,
  });

  const data = await Record.PriceData[0]

  return data;
  
};

const getLast5WorkingDays = async (_id) => {

  const Record = await Share.findOne({
    _id: _id,
  });

  const data = await Record.PriceData[1]

  return data;

};

const generate1M = async (_id) => {

  const Record = await Share.findOne({
    _id: _id,
  });

  const data = await Record.PriceData[2]

  return data;

};

const generate1Y = async (_id) => {

  const Record = await Share.findOne({
    _id: _id,
  });

  const data = await Record.PriceData[3]

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