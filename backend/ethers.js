const { ethers } = require("ethers");
require("dotenv").config();

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const abi = require("./artifacts/contracts/TaskManager.sol/TaskManager.json").abi;

const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const tasksContract = new ethers.Contract(contractAddress, abi, signer);

const addressMap = {
  ali: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  usman: "0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1",
  ahmed: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  sara: "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",
  shahzaib: "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cA2"
};

async function createTaskOnChain(title, assignee, dueDate, mongoId) {
  try {
    const resolvedAssignee = addressMap[assignee?.toLowerCase()] || assignee || await signer.getAddress();
    const dueDateTimestamp = dueDate ? Math.floor(new Date(dueDate).getTime() / 1000) : Math.floor(Date.now() / 1000) + 3 * 24 * 60 * 60;

    const txResponse = await tasksContract.createTask(title, resolvedAssignee, dueDateTimestamp, { gasLimit: 300000 });
    const txReceipt = await txResponse.wait();
    const block = await provider.getBlock(txReceipt.blockNumber);

    const event = txReceipt.events?.find(e => e.event === "TaskCreated");
    const taskId = event?.args?.taskId?.toString();

    return {
      success: true,
      taskId,
      txHash: txReceipt.transactionHash,
      blockNumber: txReceipt.blockNumber,
      blockTimestamp: new Date(block.timestamp * 1000).toISOString(),
      mongoId
    };
  } catch (error) {
    console.error("❌ Error creating task on chain:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function updateTaskOnChain(taskId, title, assignee, dueDate, mongoId) {
  try {
    const resolvedAssignee = addressMap[assignee?.toLowerCase()] || assignee || await signer.getAddress();
    const dueDateTimestamp = dueDate ? Math.floor(new Date(dueDate).getTime() / 1000) : Math.floor(Date.now() / 1000) + 3 * 24 * 60 * 60;

    const txResponse = await tasksContract.updateTask(taskId, title, resolvedAssignee, dueDateTimestamp, { gasLimit: 200000 });
    const txReceipt = await txResponse.wait();
    const block = await provider.getBlock(txReceipt.blockNumber);

    return {
      success: true,
      txHash: txReceipt.transactionHash,
      blockNumber: txReceipt.blockNumber,
      blockTimestamp: new Date(block.timestamp * 1000).toISOString(),
      updatedContent: title,
      taskId: taskId,
      action: "Updated On-Chain",
      mongoId
    };
  } catch (error) {
    console.error("❌ Error updating task on chain:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function getBlockchainTasks() {
  try {
    const createdEvents = await tasksContract.queryFilter(tasksContract.filters.TaskCreated());
    const updatedEvents = await tasksContract.queryFilter(tasksContract.filters.TaskUpdated());

    const blockchainTasks = [];

    // Process TaskCreated events
    for (const event of createdEvents) {
      const block = await provider.getBlock(event.blockNumber);
      blockchainTasks.push({
        taskId: event.args.taskId.toString(),
        title: event.args.title,
        txHash: event.transactionHash,
        blockNumber: event.blockNumber,
        blockTimestamp: new Date(block.timestamp * 1000).toISOString(),
        action: "Created On-Chain"
      });
    }

    // Process TaskUpdated events
    for (const event of updatedEvents) {
      const block = await provider.getBlock(event.blockNumber);
      blockchainTasks.push({
        taskId: event.args.taskId.toString(),
        title: event.args.title,
        txHash: event.transactionHash,
        blockNumber: event.blockNumber,
        blockTimestamp: new Date(block.timestamp * 1000).toISOString(),
        action: "Updated On-Chain"
      });
    }

    // Sort by block number to maintain chronological order
    return blockchainTasks.sort((a, b) => a.blockNumber - b.blockNumber);
  } catch (error) {
    console.error("❌ Error fetching blockchain tasks:", error);
    return [];
  }
}

async function checkBalance() {
  try {
    const address = await signer.getAddress();
    const balance = await provider.getBalance(address);
    console.log("✅ Wallet address:", address);
    console.log("💰 Hardhat Balance:", ethers.utils.formatEther(balance));
  } catch (error) {
    console.error("❌ Error checking balance:", error);
  }
}

async function showBlock() {
  try {
    const blockNumber = await provider.getBlockNumber();
    console.log("📦 Latest block:", blockNumber);
  } catch (error) {
    console.error("❌ Error fetching block number:", error);
  }
}

checkBalance();
showBlock();

module.exports = {
  createTaskOnChain,
  updateTaskOnChain,
  getBlockchainTasks
};