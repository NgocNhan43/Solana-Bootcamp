import {
  Keypair,
  Connection,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

// Replace with your local wallet or imported keypair
import { payer } from "../lib/vars";

(async () => {
  const newAccount = Keypair.generate();
  const recipient = new PublicKey("63EEC9FfGyksm7PkVC6z8uAmqozbQcTzbkWJNsgqjkFs");

  console.log("New account:", newAccount.publicKey.toBase58());

  // Step 1: Airdrop some SOL to payer (if needed)
  const payerBalance = await connection.getBalance(payer.publicKey);
 if (payerBalance < 0.5 * LAMPORTS_PER_SOL) {
  console.log("Requesting airdrop...");
  const sig = await connection.requestAirdrop(payer.publicKey, LAMPORTS_PER_SOL);
  await connection.confirmTransaction(sig, "confirmed");
}

  // Step 2: Build instructions

  // 1. Create account with 0.1 SOL
  const lamports = 0.1 * LAMPORTS_PER_SOL;

  const createIx = SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: newAccount.publicKey,
    lamports,
    space: 0,
    programId: SystemProgram.programId,
  });

  // 2. Transfer 0.1 SOL to recipient
  const transferIx = SystemProgram.transfer({
    fromPubkey: newAccount.publicKey,
    toPubkey: recipient,
    lamports,
  });

  // 3. Close the new account and refund lamports (none left, but for structure)
  const closeIx = SystemProgram.assign({
    accountPubkey: newAccount.publicKey,
    programId: payer.publicKey, // To close, reassign ownership (symbolic here as 0 lamports will remain)
  });

  // Step 3: Combine all in one transaction
  const recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const messageV0 = new TransactionMessage({
    payerKey: payer.publicKey,
    recentBlockhash,
    instructions: [createIx, transferIx, closeIx],
  }).compileToV0Message();

  const tx = new VersionedTransaction(messageV0);

  tx.sign([payer, newAccount]);

  // Step 4: Send transaction
  const signature = await connection.sendTransaction(tx);
  console.log("✅ Transaction sent:", signature);
  console.log("🔍 Explorer link:", `https://explorer.solana.com/tx/${signature}?cluster=devnet`);
})();
