import React, { useState } from "react";
import './App.css';

const App = () => {
  const [transaction, setTransaction] = useState("");
  const [amount, setAmount] = useState(0);
  const [value, setValue] = useState("");
  const [username, setUsername] = useState("");
  const [usermail, setUsermail] = useState("");
  const [userid, setUserId] = useState("");
  const [pin, setPin] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [readyForTransaction, setReadyForTransaction] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [recipientAccountId, setRecipientAccountId] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [enteredPin, setEnteredPin] = useState("");

  function createAccount(e) {
    e.preventDefault();
    if (!username || !usermail || !userid || !pin) {
      alert("Please fill all account details, including PIN.");
      return;
    }
    const accountInfo = { username, usermail, userid, pin, balance: 0 };
    setAccounts([...accounts, accountInfo]);
    setReadyForTransaction(true);
    setUsername("");
    setUsermail("");
    setUserId("");
    setPin("");
  }

  function deleteAccount(accountToDelete) {
    const updatedAccounts = accounts.filter(account => account.userid !== accountToDelete.userid);
    setAccounts(updatedAccounts);
    setReadyForTransaction(false);
    setAmount(0);
    setSelectedAccount(null);
    setRecipientAccountId("");
    setReceipt(null);
    alert("Account Deleted Successfully");
  }

  function bank(e) {
    e.preventDefault();
    if (!selectedAccount) {
      alert("Please select an account");
      return;
    }
    if (!transaction) {
      alert("Select Transaction");
      return;
    }
    if (enteredPin !== selectedAccount.pin) {
      alert("Incorrect PIN. Transaction denied.");
      return;
    }

    let transactionDetails = {
      type: transaction,
      sender: selectedAccount.username,
      recipient: null,
      amount: Number(value),
      remainingBalance: selectedAccount.balance
    };

    if (transaction === "Deposit") {
      selectedAccount.balance += Number(value);
      setAmount(selectedAccount.balance);
      transactionDetails.remainingBalance = selectedAccount.balance;
    } else if (transaction === "Withdraw") {
      if (selectedAccount.balance < Number(value)) {
        alert("Insufficient Balance");
        return;
      }
      selectedAccount.balance -= Number(value);
      setAmount(selectedAccount.balance);
      transactionDetails.remainingBalance = selectedAccount.balance;
    } else if (transaction === "Transfer") {
      if (!recipientAccountId) {
        alert("Please select a recipient account");
        return;
      }
      const recipientAccount = accounts.find(account => account.userid === recipientAccountId);
      if (!recipientAccount) {
        alert("Recipient account not found");
        return;
      }
      if (selectedAccount.balance < Number(value)) {
        alert("Insufficient Balance for Transfer");
        return;
      }
      selectedAccount.balance -= Number(value);
      recipientAccount.balance += Number(value);
      setAmount(selectedAccount.balance);
      transactionDetails.recipient = recipientAccount.username;
      transactionDetails.remainingBalance = selectedAccount.balance;
    } else {
      alert("Invalid Transaction");
      return;
    }

    setReceipt(transactionDetails);
    setValue("");
    setRecipientAccountId("");
    setEnteredPin("");
  }

  const downloadReceipt = () => {
    if (!receipt) return;
    const receiptText = `
      Transaction Receipt
      -------------------
      Transaction Type: ${receipt.type}
      Sender: ${receipt.sender}
      ${receipt.recipient ? `Recipient: ${receipt.recipient}` : ""}
      Amount: Rs.${receipt.amount}
      Remaining Balance: Rs.${receipt.remainingBalance}
    `;
    const blob = new Blob([receiptText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Transaction_Receipt.txt";
    link.click();
  };

  return (
    <div>
      <h2>Bank Application</h2>
      <form onSubmit={createAccount}>
        <h3>Create Account</h3>
        <label>User Name:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter User Name"
        />
        <br />
        <label>User Mail:</label>
        <input
          type="email"
          value={usermail}
          onChange={(e) => setUsermail(e.target.value)}
          placeholder="Enter User Mail"
        />
        <br />
        <label>User ID:</label>
        <input
          type="text"
          value={userid}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter User ID"
        />
        <br />
        <label>PIN:</label>
        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Enter PIN"
        />
        <br />
        <button type="submit">Create Account</button>
      </form>

      <h3>Account Details</h3>
      <div>
        {accounts.map(account => (
          <div key={account.userid} className="account-details">
            <ul>
              <li><strong>Name:</strong> {account.username}</li>
              <li><strong>Email:</strong> {account.usermail}</li>
              <li><strong>ID:</strong> {account.userid}</li>
              <li><strong>Balance:</strong> Rs.{account.balance}</li>
            </ul>
            <button onClick={() => {
              setSelectedAccount(account);
              setAmount(account.balance);
            }}>Select Account</button>
            <button onClick={() => deleteAccount(account)}>Delete Account</button>
          </div>
        ))}
      </div>

      {selectedAccount && (
        <h1>Selected Account: {selectedAccount.username}</h1>
      )}
      {selectedAccount && readyForTransaction && (
        <div>
          <h3>Need To Make a Transaction?</h3>
          <form onSubmit={bank}>
            <label>Choose Your Transaction</label>
            <select
              value={transaction}
              onChange={(e) => setTransaction(e.target.value)}
            >
              <option value="">-- Select --</option>
              <option value="Deposit">Deposit</option>
              <option value="Withdraw">Withdraw</option>
              {accounts.length > 1 && <option value="Transfer">Transfer</option>}
            </select>
            <h2>Your Bank Balance is Rs.{amount}</h2>
            {transaction === "Transfer" && (
              <div>
                <label>Select Recipient Account:</label>
                <select
                  value={recipientAccountId}
                  onChange={(e) => setRecipientAccountId(e.target.value)}
                >
                  <option value="">-- Select --</option>
                  {accounts
                    .filter(account => account.userid !== selectedAccount.userid)
                    .map(account => (
                      <option key={account.userid} value={account.userid}>
                        {account.username} ({account.userid})
                      </option>
                    ))}
                </select>
              </div>
            )}

            <h3>Enter The Amount</h3>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter amount"
            />
            <br />
            <h3>Enter PIN</h3>
            <input
              type="password"
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value)}
              placeholder="Enter PIN"
            />
            <br />
            <button type="submit">Submit</button>
          </form>
        </div>
      )}
      {receipt && (
        <div className="receipt">
          <h3>Transaction Receipt</h3>
          <p><strong>Transaction Type:</strong> {receipt.type}</p>
          <p><strong>Sender:</strong> {receipt.sender}</p>
          {receipt.recipient && <p><strong>Recipient:</strong> {receipt.recipient}</p>}
          <p><strong>Amount:</strong> Rs.{receipt.amount}</p>
          <p><strong>Remaining Balance:</strong> Rs.{receipt.remainingBalance}</p>
          <button onClick={downloadReceipt}>Download Receipt</button>
        </div>
      )}
    </div>
  );
};

export default App;
