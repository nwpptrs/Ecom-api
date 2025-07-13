const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { readdirSync } = require("fs");
const app = express();
const port = "3000";

app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));
app.use(cors());

readdirSync("./routes").forEach((item) =>
  app.use("/api", require("./routes/" + item))
);

app.listen(port, () => console.log(`Server is running on port ${port}`));
