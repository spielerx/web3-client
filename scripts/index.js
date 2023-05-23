import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "../constants.js";

const buttonConnect = document.getElementById("button-connect");
const buttonFund = document.getElementById("button-fund");
const buttonBalance = document.getElementById("button-balance");
const buttonWithdraw = document.getElementById("button-withdraw");

buttonConnect.onclick = connect;
buttonFund.onclick = fund;
buttonBalance.onclick = getBalance;
buttonWithdraw.onclick = withdraw;

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    buttonConnect.innerHTML = "Connected";
  } else {
    buttonConnect.innerHTML = "Install metamask";
  }
}

async function fund() {
  const ethAmount = document.getElementById("eth-amount").value;
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  console.log("signer", await signer.getAddress());
  const contract = new ethers.Contract(contractAddress, abi, signer);
  try {
    const transactionResponse = await contract.fund({
      value: ethers.utils.parseEther(ethAmount),
    });
    await listenForTransactionMine(transactionResponse, provider);
    console.log("Done");
  } catch (err) {
    console.log(err);
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  return new Promise((resolve, reject) => {
    console.log(`Mining ${transactionResponse.hash}`);
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `transaction completed with ${transactionReceipt.confirmations} confirmations`
      );
      resolve();
    });
  });
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(ethers.utils.formatEther(balance));
  }
}

async function withdraw() {
  if (typeof window.ethereum !== "undefined") {
    console.log("Withdrawing...");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    try {
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
    } catch (error) {
      console.log(error);
    }
  }
}
