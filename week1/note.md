tạo instruction (createNewAccount)
găn íntruction vào bên trong transaction (const message)
tạo tạo transaction và ký transaction 
gửi vào mạng blockchain     

-các transaction thực có thể thực thi song song không tuần tự tăng hiệu xuất trên solana

## Account: 
+ mọi thứ trên solana đều là account 
+ dùng để lữu trữ thông tin 
+mỗi account sẽ có publickey (256)
+ nhận sol từ người khác đưa publkey 
+PDA account special
+ mạng solana giống 1 cái mấy tính và account những file trong mấy tính
+ khi tạo ra account mới  phải xác định account đó có space là bao nhiêu 
+ space account dùng để lưu trữ data bên trong account và nó sẽ mất phí để rent
+ space account xác định phí dùng để lưu trũ data (có thể thay đổi)
+ defaut owner. là system program 
-> summary: account dùng để lưu trũ data(muốn lưu trũ data thì cần phí rent)

-Rent: 
+ account không đủ phí rent sẽ bị xóa đi
+ mở account -> deposit -> close account -> back rent fee(trả lại phí đã đóng vào lamport)

# Data account

+ data account
+ program account
+ native account(from dev of solan buildbuild)

+ systerm owned account (ví trên soll)
+ PDA account (program derived address) account . có pub không prive
+ ví tạo ra có publicpublic


# Account infor

address publib key (account)
- data: byte
- executable : boolen
- lamport: number (số lượng lamport account đang có (dùng để trả phí rent)), đơn vị nhỏ nhất 1sol = 10^9 lamport
- Owner: program address