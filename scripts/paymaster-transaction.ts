import {ethers} from "ethers";
import {Provider, Contract, utils, Signer} from "zksync-ethers";

// Address of the ZeekMessages contract
const ZEEK_MESSAGES_CONTRACT_ADDRESS = "";
// Address of the ERC20 token contract
const TOKEN_CONTRACT_ADDRESS = "";
// Message to be sent to the contract
const NEW_MESSAGE = "This tx cost me no ETH!";

(async () => {
  try {
    
// Note that the script needs the ABI which is generated from the compilation artifact.
  // Make sure contract is compiled and artifacts are generated
  const messagesContractArtifactsPath = `browser/contracts/artifacts/ZeekSecretMessages.json`;
  const tokenContractArtifactsPath = `browser/contracts/artifacts/TestToken.json`;

  const messagesContractABI = JSON.parse(await remix.call('fileManager', 'getFile', messagesContractArtifactsPath));
  const tokenContractABI = JSON.parse(await remix.call('fileManager', 'getFile', tokenContractArtifactsPath));

  console.log('Sending a transaction via the testnet paymaster')

  const browserProvider = new ethers.providers.Web3Provider(web3Provider)

  const zkProvider = new Provider("https://sepolia.era.zksync.dev");

  // const signer = (new ethers.providers.Web3Provider(web3Provider)).getSigner(0)
  const zkSigner = Signer.from(browserProvider.getSigner(), zkProvider);

  // const walletAddress = await signer.getAddress();
  const walletAddress = await zkSigner.getAddress();

  console.log(walletAddress)

  // initialise messages and token contracts with address, abi and signer
  const messagesContract= new Contract(ZEEK_MESSAGES_CONTRACT_ADDRESS, messagesContractABI.abi, zkSigner);
  const tokenContract= new Contract(TOKEN_CONTRACT_ADDRESS, tokenContractABI.abi, zkSigner);

// retrieve and print the current balance of the wallet
  let ethBalance = await zkProvider.getBalance(walletAddress)
  console.log(`Account ${walletAddress} has ${ethers.utils.formatEther(ethBalance)} ETH`);
  let tokenBalance = await tokenContract.balanceOf(walletAddress)
  console.log(`Account ${walletAddress} has ${ethers.utils.formatUnits(tokenBalance, 18)} tokens`);


// retrieve the testnet paymaster address
  const testnetPaymasterAddress = await zkProvider.getTestnetPaymasterAddress();

  console.log(`Testnet paymaster address is ${testnetPaymasterAddress}`);

  const gasPrice = await zkProvider.getGasPrice();

  console.log("gasPrice >> ", gasPrice)

  // define paymaster parameters for gas estimation
  const paramsForFeeEstimation = utils.getPaymasterParams(testnetPaymasterAddress, {
    type: "ApprovalBased",
    token: TOKEN_CONTRACT_ADDRESS,
    // set minimalAllowance to 1 for estimation
    minimalAllowance: ethers.BigNumber.from(1),
    // empty bytes as testnet paymaster does not use innerInput
    innerInput: new Uint8Array(0),
  });

  // estimate gasLimit via paymaster
  const gasLimit = await messagesContract.estimateGas.sendMessage(NEW_MESSAGE, {
    customData: {
      gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
      paymasterParams: paramsForFeeEstimation,
    },
  });

  console.log("gasLimit >> ", gasLimit)


  // fee calculated in ETH will be the same in
  // ERC20 token using the testnet paymaster
  const fee = gasPrice * gasLimit;

  console.log("Fee >>", fee);

  // new paymaster params with fee as minimalAllowance
  const paymasterParams = utils.getPaymasterParams(testnetPaymasterAddress, {
    type: "ApprovalBased",
    token: TOKEN_CONTRACT_ADDRESS,
    // provide estimated fee as allowance
    minimalAllowance: fee,
    // empty bytes as testnet paymaster does not use innerInput
    innerInput: new Uint8Array(0),
  });

  // full overrides object including maxFeePerGas and maxPriorityFeePerGas
  const txOverrides = {
    maxFeePerGas: gasPrice,
    maxPriorityFeePerGas: "1",
    gasLimit,
    customData: {
      gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
      paymasterParams,
    }
  }

  console.log("overrides >> ", txOverrides);

  console.log(`Sign the transaction in your wallet`);

  // send transaction with additional paymaster params as overrides
  const txHandle = await messagesContract.sendMessage(NEW_MESSAGE, txOverrides);
  console.log(`Transaction ${txHandle.hash} with fee ${ethers.utils.formatUnits(fee, 18)} ERC20 tokens, sent via paymaster ${testnetPaymasterAddress}`);
  await txHandle.wait();
  console.log(`Transaction processed`)
  
  ethBalance = await zkProvider.getBalance(walletAddress)
  tokenBalance = await tokenContract.balanceOf(walletAddress)
  console.log(`Account ${walletAddress} now has ${ethers.utils.formatEther(ethBalance)} ETH`);
  console.log(`Account ${walletAddress} now has ${ethers.utils.formatUnits(tokenBalance, 18)} tokens`);

  console.log(`Done!`);

  } catch (e) {
    console.error('Error in script!')
    console.error(e.message)
    console.error(e)
  }
})()
