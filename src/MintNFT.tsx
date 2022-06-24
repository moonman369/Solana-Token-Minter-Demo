import "./App.css";

import {
  clusterApiUrl,
  Connection,
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL, // Smallest unit of exchange of Solana, like Satoshi and Wei
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer,
  Account,
  createSetAuthorityInstruction,
  AuthorityType,
} from "@solana/spl-token";

let sendTokenAddress = "";
const message = "Default Token Address";

window.Buffer = window.Buffer || require("buffer").Buffer;

function MintNFT() {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed"); // Connect to the Solana DevNet
  const fromWallet = Keypair.generate(); // Generate a random Solana Account to use as the creator wallet
  let mint: PublicKey;
  let fromTokenAccount: Account;
  const toWallet = new PublicKey(
    sendTokenAddress || "8M785VdWLu8dwYPWizJbnbAaJxJGWoA9wGHwyFUfAy35"
  );

  const createNFT = async () => {
    const fromAirDropSignature = await connection.requestAirdrop(
      fromWallet.publicKey,
      LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(fromAirDropSignature);

    //create new NFT Mint
    mint = await createMint(
      connection,
      fromWallet,
      fromWallet.publicKey,
      null,
      0 //Only whole tokens
    );
    console.log(`Create NFT: ${mint.toBase58()}`);

    //Get the NFT account of the fromWallet address, and if it does not exist, create it
    fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      fromWallet,
      mint,
      fromWallet.publicKey
    );
    console.log(`Create NFT Account: ${fromTokenAccount.address.toBase58()}`);

    alert(
      `NFT Created: (${mint.toBase58()})\n\nCreate NFT Account: (${fromTokenAccount.address.toBase58()})\n\nOpen browser console to copy hash`
    );
  };

  const mintNFT = async () => {
    // Mint one new token to the 'fromTokenAccount' account we just created
    const txSignature = await mintTo(
      connection,
      fromWallet,
      mint,
      fromTokenAccount.address,
      fromWallet.publicKey,
      1
    );
    console.log(`Mint at signature: ${txSignature}`);
    alert(
      `Mint successful at tx signature: ${txSignature}\n\nOpen browser console to copy hash`
    );
  };

  const lockNFT = async () => {
    // Create transactions manually to change minting permissions
    let transaction = new Transaction().add(
      createSetAuthorityInstruction(
        mint,
        fromWallet.publicKey,
        AuthorityType.MintTokens,
        null
      )
    );

    let txSignature = await sendAndConfirmTransaction(connection, transaction, [
      fromWallet,
    ]);
    console.log(`Lock Signature: ${txSignature}`);
    alert(
      `NFT Locked Successfully, tx signature: ${txSignature}\n\nOpen browser console to copy hash`
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
      1 // 5billion
    );

    console.log(`Transaction successful with signature: ${txSignature}`);
    alert(
      `Transaction successful with signature: (${txSignature}).\n\nTokens sent to (${
        !sendTokenAddress || sendTokenAddress.length < 43
          ? message
          : sendTokenAddress
      })\n\nOpen browser console to copy hash`
    );
  };

  return (
    <div>
      <h2>Mint NFT Section</h2>
      <br />
      <div>
        <button onClick={createNFT}>Create NFT</button>
        &nbsp;&nbsp;
        <button onClick={mintNFT}>Mint NFT</button>
        &nbsp;&nbsp;
        <button onClick={lockNFT}>Lock NFT</button>
        <br />
        <br />
        <div>
          <input
            type="text"
            placeholder="Destination wallet address"
            onChange={async (event) => {
              sendTokenAddress = event.target.value;
            }}
          />
          <button onClick={sendToken}>Send NFT</button>
        </div>
      </div>
    </div>
  );
}

export default MintNFT;
