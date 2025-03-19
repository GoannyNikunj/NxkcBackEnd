const express = require("express");
const cors = require("cors");
const http = require("http"); 
const { Server } = require("socket.io");

const app = express();
const PORT = 3500;

app.use(cors());
// app.use(cors({ origin: "https://nxkc.netlify.app", credentials: true }));
app.use(express.json());

require("./db/Conn");
const router = require('./router/Router');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended:true }));
app.use(bodyParser.json());

var path = require("path");

app.use(express.static(path.join(__dirname, "../public"))); 

require("dotenv").config();

app.use('/', router);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
  },
});

const socketHandler = require("./router/SocketRouter");
socketHandler(io); 

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});