const axios = require("axios");

const moviesAPI = axios.create({
  baseURL: "http://18.217.97.222:4001/movies",
});

module.exports = moviesAPI;
