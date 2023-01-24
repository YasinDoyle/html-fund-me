import { ethers } from "./ethers-5.2.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const getBalanceButton = document.getElementById("getBalanceButton");
const withdrawButton = document.getElementById("withdrawButton");

connectButton.onclick = connect;
fundButton.onclick = fund;
getBalanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    console.log("I find window.ethereum!");
    try {
      await ethereum.request({ method: "eth_requestAccounts" });
    } catch (error) {
      console.log(error);
    }
    connectButton.innerHTML = "Connected";
    const accounts = await ethereum.request({ method: "eth_accounts" });
    console.log(accounts);
  } else {
    console.log("I don't find metamask");
    connectButton.innerHTML = "please input metamask!";
  }
}

async function fund() {
  //先硬编码，之后再传参进来
  const ethAmount = document.getElementById("ethAmount").value;
  console.log(`fund with amount:${ethAmount}`);
  if (typeof window.ethereum !== "undefined") {
    //document.getElementById("fundButton").innerHTML = "Funded!";
    //连接到metamask的http point
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    //获得signer,当前的用户
    const signer = provider.getSigner();
    console.log(signer);
    //连接合约，需要signer，abi以及address
    //abi和合约address需要从后端拿
    //abi在artifacts里
    //constractAddress是FundMe合约的地址
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      //等待交易被mine
      //await 关键字遇到promise必须等待promise部分完成
      await listenForTransactionMine(transactionResponse, provider);
      console.log("Done!");
    } catch (error) {
      console.log(error);
    }
  } else {
    document.getElementById("fundButton").innerHTML = "Please input metamask!";
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`);
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `completed with ${transactionReceipt.confirmations} confirmations`
      );
      resolve();
    });
  });
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    try {
      const balance = await provider.getBalance(contractAddress);
      console.log(ethers.utils.formatEther(balance));
    } catch (error) {
      console.log(error);
    }
  } else {
    balanceButton.innerHTML = "Please install MetaMask";
  }
}

async function withdraw() {
  console.log(`Withdrawing...`);
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
    } catch (error) {
      console.log(error);
    }
  } else {
    withdrawButton.innerHTML = "Please install MetaMask";
  }
}
