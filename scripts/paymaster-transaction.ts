import {ethers} from "ethers";
import {Provider, Contract, utils} from "zksync-ethers";

// Address of the ZeekMessages contract
const ZEEK_MESSAGES_CONTRACT_ADDRESS = "0x6519565BF8bA80295C0EC0AD8C286C078DDea8ae";
// Address of the ERC20 token contract
const TOKEN_CONTRACT_ADDRESS = "0x6F1e8260031b0E720DEae3ab44d7761123025A81";
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

  // initialise zkSync provider to retrieve paymaster address
  const zkProvider = new Provider("https://sepolia.era.zksync.dev");

  const signer = (new ethers.providers.Web3Provider(web3Provider)).getSigner(0)

  // signer.provider.formatter.formats.TransactionRequest = {...signer.provider.formatter.formats.TransactionRequest, customData: "function(t){return null==t?a:e(t)}"}

  const walletAddress = await signer.getAddress();

  console.log(walletAddress)

  // initialise messages and token contracts with address, abi and signer
  const messagesContract= new Contract(ZEEK_MESSAGES_CONTRACT_ADDRESS, messagesContractABI.abi, signer);
  const tokenContract= new Contract(TOKEN_CONTRACT_ADDRESS, tokenContractABI.abi, signer);

// retrieve and print the current balance of the wallet
  let ethBalance = await zkProvider.getBalance(walletAddress)
  console.log(`Account ${walletAddress} has ${ethers.utils.formatEther(ethBalance)} ETH`);
  let tokenBalance = await tokenContract.balanceOf(walletAddress)
  console.log(`Account ${walletAddress} has ${ethers.utils.formatUnits(tokenBalance, 18)} tokens`);


// retrieve the testnet paymaster address
  const testnetPaymasterAddress = await zkProvider.getTestnetPaymasterAddress();

  console.log(`Testnet paymaster address is ${testnetPaymasterAddress}`);

  const gasPrice = await zkProvider.getGasPrice();

  console.log(gasPrice)

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

  // fee calculated in ETH will be the same in
  // ERC20 token using the testnet paymaster
  const fee = gasPrice * gasLimit;

  console.log(fee);

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

  console.log(txOverrides);

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
    console.log(e.message)
  }
})()
