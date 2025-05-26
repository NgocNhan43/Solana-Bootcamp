/**
 * This script demonstrates how to construct and send a basic transaction
 * to the Solana blockchain
 */

import {
    Keypair,
    LAMPORTS_PER_SOL,
    SystemProgram,
    TransactionMessage,
    VersionedTransaction,
  } from "@solana/web3.js";
  
  import { payer, connection } from "../lib/vars";
  import { explorerURL, printConsoleSeparator } from "../lib/helpers";
  //payer người thực hiện transaction người trả phí cho transaction  là user thực thi transaction 
  /*
    payer: tài khoản (keypair) chính để trả phí cho giao dịch (đã được định nghĩa trong file vars).
    connection: kết nối tới mạng Solana.
    explorerURL, printConsoleSeparator: các hàm trợ giúp để in kết quả ra console.
      
  */


  (async () => {
    console.log("Payer address:", payer.publicKey.toBase58());
  /*
  Tạo hàm async tự gọi ngay để chạy toàn bộ đoạn code.
  In ra địa chỉ công khai (public key) của tài khoản payer dưới dạng chuỗi Base58.*/ 


    // get the current balance of the `payer` account on chain
    // lấy ra số dư hiện tại  của tài khoản payer trên blockchain (đơn vị lamports, 1sol = 1 tỷ lamport)
    // in ra số dư này dưới dạng lamport và  quy đổi sang sol
    const currentBalance = await connection.getBalance(payer.publicKey);
    console.log("Current balance of 'payer' (in lamports):", currentBalance);
    console.log("Current balance of 'payer' (in SOL):", currentBalance / LAMPORTS_PER_SOL);
  
    // airdrop on low balance
    // nếu số dư hiện tại nhỏ hơn 1 sol gửi  yêu cầu  airdrop (nhận sol miễn phí từ mạng testnet) vào tài khoản payer
    if (currentBalance <= LAMPORTS_PER_SOL) {
      console.log("Low balance, requesting an airdrop...");
      // await connection.requestAirdrop(payer.publicKey, LAMPORTS_PER_SOL);
      // đợi cho giao dịch aridrop xác nhận trước khi tiếp tục 
      const sig = await connection.requestAirdrop(payer.publicKey, LAMPORTS_PER_SOL);

      await connection.confirmTransaction(sig, "confirmed");
    }
  
    // generate a new, random address to create on chain
    // tạo ra 1 keyparit mới hoàn toàn ngẫu nhiên , đại diện cho 1 tài khoản mới  trên solana 
    
    const keypair = Keypair.generate(); // public key, private key
    //in ra 1 địa chỉ công khai  của tài khoản mới nà
    console.log("New keypair generated:", keypair.publicKey.toBase58());
  
    /**
     * create a simple instruction (using web3.js) to create an account
     */
  
    // on-chain space to allocated (in number of bytes)
    //Đặt số byte bộ nhớ trên blockchain mà tài khoản mới sẽ chiếm dụng là 0 (ở đây không cần lưu trữ gì).
    const space = 0;
  
    // request the cost (in lamports) to allocate `space` number of bytes on chain
    //Lấy số lamports tối thiểu cần nạp vào tài khoản mới để miễn phí thuê bộ nhớ (rent exemption).
    const lamports = await connection.getMinimumBalanceForRentExemption(space);
  
    // 5000 * 4 = gas fee
  
    console.log("Total lamports:", lamports);
  
    // create this simple instruction using web3.js helper function
    //Tạo một "instruction" (hướng dẫn thực thi trên blockchain) để tạo tài khoản mới với các tham số:
    const createAccountIx = SystemProgram.createAccount({
      // `fromPubkey` - this account will need to sign the transaction
      //fromPubkey: tài khoản payer chịu phí.
      fromPubkey: payer.publicKey,

      // `newAccountPubkey` - the account address to create on chain
      //tài khoản mới tạo.
      newAccountPubkey: keypair.publicKey,
      // lamports to store in this account
      //lamports: số lamports gửi vào tài khoản mới.
      lamports,
      // total space to allocate
      //space: số byte cấp phát (ở đây là 0).
      space,
      // the owning program for this account
      //programId: chương trình quản lý tài khoản mới (ở đây là SystemProgram).
      programId: SystemProgram.programId,
    });
  
    /**
     * build the transaction to send to the blockchain
     */
  
    // get the latest recent blockhash
    //Lấy blockhash mới nhất trên mạng để gắn vào giao dịch (dùng để tránh giao dịch bị trùng và hết hạn).
    const recentBlockhash = await connection.getLatestBlockhash().then(res => res.blockhash);


  /*Tạo một TransactionMessage với:

Người trả phí (payerKey),
-Blockhash mới nhất,
-Danh sách các hướng dẫn (ở đây chỉ có 1 instruction tạo tài khoản mới).
-Biên dịch thành message phiên bản 0.*/
    // create a message (v0)
    const message = new TransactionMessage({
      payerKey: payer.publicKey,
      recentBlockhash,
      instructions: [createAccountIx],
    }).compileToV0Message();
  
    // create a versioned transaction using the message
    /*
    -Tạo giao dịch versioned (phiên bản mới) từ message.
    -Ký giao dịch bằng các private key cần thiết: tài khoản trả phí (payer) và tài khoản mới (keypair).
    -In ra đối tượng giao dịch đã ký.
    */
    const tx = new VersionedTransaction(message);
  
    // sign the transaction with our needed Signers (e.g. `payer` and `keypair`)

    tx.sign([payer, keypair]);
    console.log("tx after signing:", tx);
  
    // actually send the transaction
    //Gửi giao dịch lên mạng Solana, nhận về chữ ký (signature) của giao dịch đó.
    const signature = await connection.sendTransaction(tx);
  
    /**
      display some helper text
      In dòng ngăn cách.
      Thông báo giao dịch đã hoàn thành.
      In URL tới trình duyệt explorer của Solana để bạn có thể xem chi tiết giao dịch vừa gửi.
     */
    printConsoleSeparator();
    console.log("Transaction completed.");
    console.log(explorerURL({ txSignature: signature }));


    /*
    1,Kiểm tra số dư tài khoản payer.

    2,Nếu số dư thấp, yêu cầu airdrop.

    3,Tạo một tài khoản mới trên blockchain.

    4,Tạo và ký giao dịch tạo tài khoản mới.

    5,Gửi giao dịch lên mạng Solana.

    6,In link xem chi tiết giao dịch.

*/
  })();