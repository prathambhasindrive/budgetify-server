const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");

// -------------------------Routes------------------------------
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
// ------------------------Middlewares---------------------------
require("dotenv").config();
app.use(express.json());
app.use(cookieParser());
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
