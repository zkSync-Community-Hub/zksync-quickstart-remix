# ZKsync quickstart Remix

This repo contains a sample project used in the [ZKsync quickstart](https://docs.zksync.io/build/start-coding/quick-start).

The project contains the following smart contracts:

- `ZeekSecretMessages.sol`: stores secret messages
- `TestToken.sol`: a mintable ERC20 token

And the following scripts:

- `mint-token.ts`: mints a given amount of the ERC20 token to an address.
- `paymaster-transaction.ts`: sends a message to the `ZeekSecreMessages.sol` contract paying the transaction fees with the `TestToken.sol` ERC20 token.
  

## Open in Remix

- [Click here to open this project in Remix](https://remix.ethereum.org/?#activate=zkSync&call=zkSync//loadFromGithub//ZKsync-Community-Hub//zksync-quickstart-remix//)
