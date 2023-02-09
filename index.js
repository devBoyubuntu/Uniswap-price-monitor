const Big = require("big.js");
const blockchain = require("./blockchain");
const UniswapV2Pair = require("./abi/IUniswapV2Pair.json");

const pair = { name: "ETH/DAI", address: "0xa478c2975ab1ea89e8196811f51a7b7ade33eb11" };

const state = {
	blockNumber: undefined,
	token0: undefined,
	token1: undefined
};

const getContract = {
    http: new blockchain.web3http.eth.Contract(UniswapV2Pair.abi, pair.address),
    ws: new blockchain.web3ws.eth.Contract(UniswapV2Pair.abi, pair.address)
};

const getReserves = async (constract) => {
	const reserves = await constract.methods.getReserves().call();
	return [Big(reserves.reserve0), Big(reserves.reserve1)];
};

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const update = (data) => {
	state.token0 = Big(data.returnValues.reserve0);
	state.token1 = Big(data.returnValues.reserve1);
	state.blockNumber = data.blockNumber;
	console.log(`${state.blockNumber} Price ${pair.name} : ${state.token0.div(state.token1).toString()}`);
};

const http = async () => {
	while (true) {
		const [amtToken0, amtToken1] = await getReserves(getContract.http);
		console.log(`Price ${pair.name} : ${amtToken0.div(amtToken1).toString()}`);
		await sleep(1000);
	}
};

const ws = async () => {
	[state.token0, state.token1] = await getReserves(getContract.ws);
	state.blockNumber = await blockchain.web3http.eth.getBlockNumber();
	getContract.ws.events.Sync({}).on("data", (data) => update(data));
	console.log(`${state.blockNumber} Price ${pair.name} : ${state.token0.div(state.token1).toString()}`);
};

ws();