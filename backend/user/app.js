require("dotenv").config();

const cors = require("cors");
const express = require("express");
const userRoutes = require("./routes/user");
const app = express();
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "https://sonic-totem-438312-d0.et.r.appspot.com", credentials: true }));
app.use(cookieParser());

app.use("/user", userRoutes);

app.get("/", function (req, res) {
  res.send(`Hallo`);
});

console.log(process.env.JWT_SECRET);

const server = app.listen(8081, function () {
  const port = server.address().port;

  console.log("Example app listening at http://localhost:%s", port);
});


