const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");

// -------------------------Routes------------------------------
const userRoutes = require("./routes/userRoutes");
// ------------------------Middlewares---------------------------
require("dotenv").config();
app.use(express.json());
app.use(cookieParser());
// -------------------------Importing----------------------------
const dbConnect = require("./config/database");
const PORT = process.env.PORT || 8000;

// ----------------------------------------------------------------

app.use("/api/v1/user", userRoutes);

app.get("/", (req, res) => {
  res.send("Hello! This is Server ");
});

app.listen(PORT, () => {
  console.log(`Example app listening on -  http://localhost:${PORT}`);
});

dbConnect();
