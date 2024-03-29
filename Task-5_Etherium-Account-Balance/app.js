const express = require('express');
const { Web3 } = require('web3');

const app = express();
const port = 3000;

const getWeb3 = async () => {
    return new Promise(async (resolve, reject) => {
        
        try {
            // Checking if MetaMask is installed and enabled
            if (typeof window !== 'undefined' && window.ethereum) {
                console.log(window.ethereum);
                // Requesting the account access if needed
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                // Using MetaMask ethereum provider
                const web3 = new Web3(window.ethereum);
                resolve(web3);
            } else {
                throw new Error('MetaMask not installed');
            }
        } catch (error) {
            reject(error);
        }
    });
}

// Get API to check the balance of etherem accounts 
app.get('/wallet-info', async (req, res) => {
    try {
        const web3 = await getWeb3();   // getWeb3() will connect with Metamask

        const accounts = await web3.eth.getAccounts(); // responsible for getting accounts linked with ethereum

        const walletAddress = accounts[0];  //first account will be assigned to walletAddress

        const walletBalanceWei = await web3.eth.getBalance(walletAddress); // getting balance of walletAddress

        const walletBalanceEth = web3.utils.fromWei(walletBalanceWei, 'ether'); // conversion from Wei to Ether

        const responseData = {
            walletAddress: walletAddress,
            walletBalanceEth: parseFloat(walletBalanceEth)
        };

        res.json(responseData);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
