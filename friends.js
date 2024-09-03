<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Friends</title>
    <link rel="stylesheet" href="friends.css">
</head>
<body>
    <main>
        <h1>Friends</h1>
        <div class="invite-container">
            <h2>Your Referral Link</h2>
            <input type="text" id="referral-link" readonly>
            <button onclick="copyLink()">Copy Link</button>
        </div>
        <div class="invite-container">
            <h2>Join Using Referral Link</h2>
            <input type="text" id="referral-input" placeholder="Enter referral link" disabled>
            <button onclick="alert('Referral link usage is handled via Telegram bot.')" disabled>Add Friend</button>
        </div>
    </main>
    <footer>
        <div class="nav-container">
            <button onclick="location.href='index.html'" class="nav-button">Home</button>
            <button onclick="location.href='gorev.html'" class="nav-button">Görev</button>
            <button onclick="location.href='frend.html'" class="nav-button">Frend</button>
            <button onclick="location.href='wallet.html'" class="nav-button">Wallet</button>
        </div>
    </footer>
    <script src="friends.js"></script>
</body>
</html>
