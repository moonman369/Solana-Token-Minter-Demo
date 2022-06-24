import "./App.css";

import {
  clusterApiUrl,
  Connection,
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL, // Smallest unit of exchange of Solana, like Satoshi and Wei
} from "@solana/web3.js";

import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer,
  Account,
  getMint,
  getAccount,
} from "@solana/spl-token";

// import { collapseTextChangeRangesAcrossMultipleVersions } from "typescript";

window.Buffer = window.Buffer || require("buffer").Buffer;

let [checkBalanceOf, mintTokenAmount, sendTokenAddress] = ["", "", ""];
let tokenAccountInfo;
const message = "Default Token Address";

function MintToken() {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed"); // Connect to the Solana DevNet
  const fromWallet = Keypair.generate(); // Generate a random Solana Account to use as the creator wallet
  let mint: PublicKey;
  let fromTokenAccount: Account;
  const toWallet = new PublicKey(
    sendTokenAddress || "8M785VdWLu8dwYPWizJbnbAaJxJGWoA9wGHwyFUfAy35"
  );

  //8M785VdWLu8dwYPWizJbnbAaJxJGWoA9wGHwyFUfAy35
  const createToken = async () => {
    const fromAirDropSignature = await connection.requestAirdrop(
      fromWallet.publicKey,
      LAMPORTS_PER_SOL
    ); // Request a SOL airdrop to the creator account

    await connection.confirmTransaction(fromAirDropSignature);

    mint = await createMint(
      connection,
      fromWallet,
      fromWallet.publicKey,
      null,
      9 // means 1 unit = 10^-9 tokens i.e 1 token is divisible upto 9 dec places
    );
    console.log(`Create token: ${mint.toBase58()}`);

    fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      fromWallet,
      mint,
      fromWallet.publicKey
    );
    console.log(`Create Token Account: ${fromTokenAccount.address.toBase58()}`);
    alert(
      `Token created at address: (${mint.toBase58()})\n\nAssociated Token Account: (${fromTokenAccount.address.toBase58()})\n\nOpen browser console to copy hash`
    );
  };

  const mintToken = async () => {
    const txSignature = await mintTo(
      connection,
      fromWallet,
      mint,
      fromTokenAccount.address,
      fromWallet.publicKey,
      (Number(mintTokenAmount) || 10) * 1000000000
    );
    console.log(`Mint Tx Signature: ${txSignature}`);
    alert(
      `Mint Tx Signature: ${txSignature}\n\nMint Amount: ${
        mintTokenAmount || 10
      } tokens\n\nOpen browser console to copy hash`
    );
  };

  const checkBalance = async () => {
    //Getting total supply of tokens minter into existance
    const mintInfo = await getMint(connection, mint);
    console.log(`Total Supply: ${mintInfo.supply}`);

    // Get the amount of tokens left in the creator account
    tokenAccountInfo = await getAccount(connection, fromTokenAccount.address);
    console.log(checkBalanceOf);
    console.log(`Associated Token Account Balance: ${tokenAccountInfo.amount}`);
    alert(
      `Total Supply: ${
        Number(mintInfo.supply) / LAMPORTS_PER_SOL
      } tokens\n\nAssociated Token Account Balance: ${
        Number(tokenAccountInfo.amount) / LAMPORTS_PER_SOL
      } tokens\n\nOpen browser console to copy hash`
    );
  };

  const sendToken = async () => {
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      fromWallet,
      mint,
      toWallet
    );

    const txSignature = await transfer(
      connection,
      fromWallet,
      fromTokenAccount.address,
      toTokenAccount.address,
      fromWallet.publicKey,
      5000000000 // 5billion
    );

    console.log(`Transaction successful with signature: ${txSignature}`);
    alert(
      `Transaction successful with signature: (${txSignature}).\n\nTokens sent to (${
        !sendTokenAddress ? message : sendTokenAddress
      })\n\nOpen browser console to copy hash`
    );
  };

  // const handleInputChange = async (event) => {
  //   const target = event.target;
  //   const value = target.type === "checkbox" ? target.checked : target.value;
  //   const name = target.name;
  //   console.log(name);
  // };

  return (
    <div>
      <h2>Mint Token Section</h2>
      <br />
      <div>
        <button onClick={createToken}>Create Token</button>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <input
          type="number"
          placeholder="Number of tokens to mint"
          onChange={async (event) => {
            mintTokenAmount = event.target.value;
          }}
        />
        <button onClick={mintToken}>Mint Token</button>
      </div>
      <br />
      <div>
        {/* <input
          type="text"
          onChange={async (event) => {
            checkBalanceOf = event.target.value;
          }}
        /> */}
        <button onClick={checkBalance}>Check Minter Account Balance</button>
      </div>
      <br />
      <div>
        <input
          type="text"
          placeholder="Destination wallet address"
          onChange={async (event) => {
            sendTokenAddress = event.target.value;
          }}
        />
        <button onClick={sendToken}>Send 5 Tokens</button>
      </div>
    </div>
  );
}

export default MintToken;
