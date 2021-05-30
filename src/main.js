const api = require("etherscan-api").init("T6HHQQ8IPK6JHY8VYY6Y4UNB82R7NJSP59");
const abiDecoder = require("abi-decoder");
const testABI = require("./testABI").default;
const _ = require("lodash");
const BigNumber = require("bignumber.js");
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");

// Using HTTPS
const web3 = createAlchemyWeb3(
  "https://eth-mainnet.alchemyapi.io/v2/a6KnQ5SAGo0BVpFQGFXCihdBOB0h9YGN"
);

abiDecoder.addABI(testABI);

const getSwap = async (address) => {
  const abi = await api.contract.getabi(address);
  // console.log(abi);

  const c = new web3.eth.Contract(JSON.parse(abi.result), address);

  const token0 = await c.methods.token0().call(); // keep
  const token1 = await c.methods.token1().call(); // eth

  return {
    token0: await web3.alchemy.getTokenMetadata(token0),
    token1: await web3.alchemy.getTokenMetadata(token1),
  };
};

(async () => {
  // var blockNumber = await api.proxy.eth_getBlockByNumber('12288337');
  // console.log(blockNumber);

  // 获取区块所有交易
  const block = await web3.eth.getBlock(12288337);
  let transactions = await Promise.all(
    _.map(block.transactions, (tid) => web3.eth.getTransaction(tid))
  );
  
  // 留下有重复地址的
  const x = _.filter(
    _.map(
      _.groupBy(transactions, (d) => [d.from, d.to]),
      (v, k) => (_.size(v) > 1 ? { [k]: v } : {})
    ),
    (d) => _.size(d) != 0
  );

  console.log(JSON.stringify(x, null, 2));

  // 获取交易的收据
  const a = await web3.eth.getTransactionReceipt(
    // "0x45fbbb1dcae20cbe7d72994122800f80f3d2922e9817f308ed6d17f1a0c74078"
    "0x70daf862ab36e708406d1e242f38e16addd9451a3da3ffe0073f7ab00501818b"
  );
  // console.log(a['from'], a['to']);

  // 获取涉及到合约的abi信息
  const abis = await Promise.all(
    a.logs.map((l) => api.contract.getabi(l.address))
  );
  abis.map((a) => abiDecoder.addABI(JSON.parse(a.result)));
  // // console.log(abis);

  // 取出交易中Swap信息
  const logs = _.filter(abiDecoder.decodeLogs(a.logs), (l) => l.name == "Swap");
  _.forEach(logs, async (l) => {
    const args = _.keyBy(l.events, "name");
    const tokens = await getSwap(l.address);

    console.log(args['amount0In']['value'], args['amount1In']['value']);
    console.log(args['amount0Out']['value'], args['amount1Out']['value']);

    console.log(tokens);
  });
  // console.log(JSON.stringify(logs));
  // _.map(logs, async (l) => {
  //   const t = _.filter(l.events, (d) => d.name == "from" && d.type == "address")[0];
  //   console.log(t);
  //   console.log(
  //     await web3.alchemy.getTokenMetadata(
  //       t
  //     )
  //   );
  // });
  // console.log(await web3.alchemy.getTokenMetadata('0xe6f19dab7d43317344282f803f8e8d240708174a'));
  // console.log(JSON.stringify(abis));
  // const logs = await web3.eth.getPastLogs({
  //   fromBlock: 12288337,
  //   toBlock: 12288337,
  //   address: '0xd2D5862C001B7Ba77970e13C173356BF1A551E2E',
  //   topics: [
  //     "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef", // Transfer
  //     "0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1", // Sync
  //     "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822", // Swap
  //   ],
  // });
  // console.log(logs);
  // const logs = await api.log.getLogs(
  //   "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  //   12288337,
  //   12288337,
  //   "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
  // ).catch(e => console.log("ee", e));
  // console.log(logs);
  // var txlist = await api.account.txlist('', '12288337', '12288337', 1, 100, 'asc');
  // console.log(txlist);
  // var res = await api.proxy
  //   .eth_getTransactionByHash(
  //     "0xddeaaec97b0c178718352108c2eb6b499511982029b1d1cca38c734da961d96c"
  //   )
  //   .catch((e) => console.log(e));
  // const decodedData = abiDecoder.decodeMethod(res.result.input);
  // console.log(decodedData.params.filter((d) => d.name == "to"));
  // const b = new BigNumber(12375875836);
  // console.log(b.toNumber());
  // var txlist = await api.account.txlist('0x7a250d5630b4cf539739df2c5dacb4c659f2488d', 1, '12288337', 1, 100, 'desc');
  // txlist.result.map(tx => {
  //   console.log(tx, abiDecoder.decodeMethod(tx.input));
  // })
  // const decodedData = abiDecoder.decodeMethod(txlist.result[0].input);
  // console.log( decodedData);
  // var txlist = await api.account
  //   .tokentx(
  //     "0x7a250d5630b4cf539739df2c5dacb4c659f2488d",
  //     "",
  //     // "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  //     "12217797",
  //     "latest",
  //     "asc"
  //   )
  //   .catch((e) => console.log(e));
  // _.forEach(
  //   _.groupBy(txlist.result, (d) => d.blockNumber),
  //   (txlist, block) => {
  //     const grouped = _.groupBy(txlist, (d) =>
  //       d.from == "0x7a250d5630b4cf539739df2c5dacb4c659f2488d" ? "from" : "to"
  //     );
  //     // 收币
  //     const from = _.groupBy(grouped["to"], (d) => d["from"]);
  //     // 发币
  //     const to = _.groupBy(grouped["from"], (d) => d["to"]);
  //     const found = _.intersection(_.keys(from), _.keys(to));
  //     console.log(found);
  //     // console.log(JSON.stringify(from, null, 2));
  //     // console.log(JSON.stringify(to, null, 2));
  //   }
  // );
})();

// const { createAlchemyWeb3 } = require("@alch/alchemy-web3");

// // Using HTTPS
// const web3 = createAlchemyWeb3("https://eth-mainnet.alchemyapi.io/v2/a6KnQ5SAGo0BVpFQGFXCihdBOB0h9YGN");

// // web3.eth.getBlock("latest").then((block) => {
// //   console.log(block);

// // });

// (async () => {
//   const resp = await web3.alchemy.getAssetTransfers({
//     toAddress: "0x7a250d5630b4cf539739df2c5dacb4c659f2488d",
//     // maxCount: 1000,
//   });
//   console.log(resp.transfers);

//   //   const block = await web3.eth.getBlock("latest");
//   //   console.log(block);
//   //   for (index in block.transactions) {
//   //     const tid = block.transactions[index];
//   //     const t = await web3.eth.getTransaction(tid);
//   //     console.log(t.from, t.to);
//   //     // if (t.to == '0x65f251bd86a8f01356fe83119d7466d9269eb73b') {
//   //     //     console.log(t.from, t.to);
//   //     // }
//   //   }
// })();
