const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require('cors');
// -------------------------Routes------------------------------
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
// ------------------------Middlewares---------------------------
require("dotenv").config();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
// -------------------------Importing----------------------------
const dbConnect = require("./config/database");
const PORT = process.env.PORT || 8000;

// ----------------------------------------------------------------

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/category",categoryRoutes);

app.get("/", (req, res) => {
  res.send("Hello! This is Server. How are you?");
});

app.listen(PORT, () => {
  console.log(`Example app listening on -  http://localhost:${PORT}`);
});

dbConnect();
