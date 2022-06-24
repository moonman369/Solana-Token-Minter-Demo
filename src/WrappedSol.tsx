import "./App.css";

import {
  clusterApiUrl,
  Connection,
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL, // Smallest unit of exchange of Solana, like Satoshi and Wei
  Transaction,
  sendAndConfirmTransaction,
  SystemProgram,
} from "@solana/web3.js";

import {
  getOrCreateAssociatedTokenAccount,
  createSyncNativeInstruction,
  createAssociatedTokenAccountInstruction,
  NATIVE_MINT,
  transfer,
  closeAccount,
  getAccount,
  getAssociatedTokenAddress,
} from "@solana/spl-token";

window.Buffer = window.Buffer || require("buffer").Buffer;

let [mintTokenAmount, sendTokenAddress] = ["", ""];
const message = "Default Token Address";

function WrappedSol() {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed"); // Connect to the Solana DevNet
  const fromWallet = Keypair.generate(); // Generate a random Solana Account to use as the creator wallet
  const toWallet = new PublicKey(
    sendTokenAddress || "8M785VdWLu8dwYPWizJbnbAaJxJGWoA9wGHwyFUfAy35"
  );
  let associatedTokenAccount: PublicKey;

  const wrapSol = async () => {
    console.log(mintTokenAmount);
    const fromAirDropSignature = await connection.requestAirdrop(
      fromWallet.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(fromAirDropSignature);

    associatedTokenAccount = await getAssociatedTokenAddress(
      NATIVE_MINT,
      fromWallet.publicKey
    );

    console.log(
      `Associated WSOL Account: ${associatedTokenAccount.toBase58()}`
    );

    //Create token account to store the Wrapped SOL
    const ataTransaction = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        fromWallet.publicKey,
        associatedTokenAccount,
        fromWallet.publicKey,
        NATIVE_MINT
      )
    );

    await sendAndConfirmTransaction(connection, ataTransaction, [fromWallet]);

    const solTransferConfirmTransaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromWallet.publicKey,
        toPubkey: associatedTokenAccount,
        lamports: LAMPORTS_PER_SOL,
      }),
      createSyncNativeInstruction(associatedTokenAccount)
    );

    await sendAndConfirmTransaction(connection, solTransferConfirmTransaction, [
      fromWallet,
    ]);
    const accountInfo = await getAccount(connection, associatedTokenAccount);
    console.log(
      `Native: ${accountInfo.isNative}, Lamports: ${accountInfo.amount}`
    );
    alert(
      `Associated WSOL Account: ${associatedTokenAccount.toBase58()}\n\nWSOL Balance: ${
        Number(accountInfo.amount) / LAMPORTS_PER_SOL
      }\n\nOpen browser console to copy hash`
    );
  };

  const unwrapSol = async () => {
    const walletBalance = await connection.getBalance(fromWallet.publicKey);
    console.log(`Balance before unwrapping WSOL: ${walletBalance}`);
    await closeAccount(
      connection,
      fromWallet,
      associatedTokenAccount,
      fromWallet.publicKey,
      fromWallet
    );
    const walletBalancePostUnwrap = await connection.getBalance(
      fromWallet.publicKey
    );
    console.log(`Balance after unwrapping WSOL:  ${walletBalancePostUnwrap}`);
  };

  const sendWrappedSol = async () => {
    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      fromWallet,
      NATIVE_MINT,
      fromWallet.publicKey
    );

    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      fromWallet,
      NATIVE_MINT,
      toWallet
    );

    const txSignature = await transfer(
      connection,
      fromWallet,
      fromTokenAccount.address,
      toTokenAccount.address,
      fromWallet.publicKey,
      LAMPORTS_PER_SOL
    );

    console.log(
      `Transaction successful with signature: ${txSignature}   ${toTokenAccount.address}`
    );
    alert(
      `Transaction successful with signature: (${txSignature}).\n\n1 WSOL sent to (${
        !sendTokenAddress || sendTokenAddress.length < 43
          ? message
          : sendTokenAddress
      })\n\nOpen browser console to copy hash`
    );
  };

  return (
    <div>
      <h2>Wrap SOL Section</h2>
      <br />
      <div>
        {/* <input
          type="number"
          placeholder="Number of SOL to wrap"
          onChange={async (event) => {
            mintTokenAmount = event.target.value;
          }}
        /> */}
        <button onClick={wrapSol}>Wrap SOL</button>
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
        <button onClick={sendWrappedSol}>Send WSOL</button>
      </div>
      <div>
        <br />
        <button onClick={unwrapSol}>Unwrap WSOL</button>
        <br />
      </div>
    </div>
  );
}

export default WrappedSol;
