const express = require("express");
const cors = require("cors");
require("dotenv").config();
const weatherRoutes=require("./Routes/weatherRoutes");
    

const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
    res.send(
        "Weather app running!")
});
app.use("/api/weather", weatherRoutes);
const PORT = process.env.PORT || 5000;
app.listen(5000, () => {
    console.log("Server is running on port 5000!")
});
