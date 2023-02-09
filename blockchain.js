require("dotenv").config();
const Web3 = require("web3");

const web3http = new Web3(process.env.URL_HTTP);
const web3ws = new Web3(process.env.URL_WS);

module.exports = { web3http, web3ws };