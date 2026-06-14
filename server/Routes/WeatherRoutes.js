const express = require("express");
const axios = require("axios");

const router = express.Router();
router.get("/location/current", async (req, res) => {
  try {
    const { lat, lon } = req.query;

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.API_KEY}&units=metric`
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      message: "Location weather error",
    });
  }
});


router.get("/forecast/:city", async (req, res) => {
  try {
    const city = req.params.city;

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${process.env.API_KEY}&units=metric`
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({
      message: "Forecast error"
    });
  }
});
router.get("/:city", async (req, res) => {
  try {
    const city = req.params.city;

    console.log("Searching city:", city);
    console.log("API KEY:", process.env.API_KEY);

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.API_KEY}&units=metric`
    );

    res.json(response.data);
  } catch (error) {
    console.log(error.response?.data || error.message);

    res.status(500).json({
      message: "Error fetching weather",
    });
  }

});
module.exports = router;