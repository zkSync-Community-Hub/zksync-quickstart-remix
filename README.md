# zkSync quickstart Remix

This project contains the following smart contracts:

- `ZeekSecretMessages.sol`: stores secret messages
- `TestToken.sol`: a mintable ERC20 token

And the following scripts:

- `mint-token.ts`: mints a given amount of the ERC20 token to an address.
- `paymaster-transaction.ts`: sends a message to the `ZeekSecreMessages.sol` contract paying the transaction fees with the `TestToken.sol` ERC20 token.
  

You can deploy these contracts and run the provided scripts using Remix:

### Remix IDE links

- [Open `ZeekSecretMessages.sol` in Remix](https://remix.ethereum.org/#url=https://github.com/uF4No/zksync-101-remix/)
- [Open `TestToken.sol` in Remix](https://remix.ethereum.org/#url=https://github.com/uF4No/zksync-101-remix/blob/master/contracts/TestToken.sol)
- [Open `mint-token.ts` in Remix](https://remix.ethereum.org/#url=https://github.com/uF4No/zksync-101-remix/blob/master/scripts/mint-token.ts)
- [Open `paymaster-transaction.ts` in Remix](https://remix.ethereum.org/#url=https://github.com/uF4No/zksync-101-remix/blob/master/scripts/paymaster-transaction.ts)
