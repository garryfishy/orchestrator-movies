const axios = require("axios");

const tvSeriesApi = axios.create({
  baseURL: "http://18.218.140.12:4002/tvseries",
});

module.exports = tvSeriesApi;
