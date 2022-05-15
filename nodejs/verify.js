require('dotenv').config({ path: '../.env' });
const Web3 = require('web3');
const fs = require('fs');
const crypto = require('crypto');


let contractAbiString = fs.readFileSync('../contract.json');
const {abi, address} = JSON.parse(contractAbiString);

const web3 = new Web3(process.env.NETWORK_URL)
const CertificateStorage = new web3.eth.Contract(abi, address)

const verifyObj = async (data) => {
    const hash = crypto.createHash('sha256').update(JSON.stringify(data)).digest('base64');
    console.log(hash);
    return await CertificateStorage.methods.isCertAvailable(hash).call((err, res) => {
        if (err) {
            throw err;
        }
        return res;
    });
}


const createCert = async (data) => {
    const account = process.env.PUBLIC_KEY;
    const privateKey = process.env.PRIVATE_KEY

    console.log("Creating transaction...");
    const hash = crypto.createHash('sha256').update(JSON.stringify(data)).digest('base64');

    try{
        const tx = await CertificateStorage.methods.createCert(hash).encodeABI();
        const txObject = {
            nonce: await web3.eth.getTransactionCount(account),
            gasLimit: 800000,
            gasPrice: web3.utils.toWei('10', 'gwei'),
            chainId: Number(process.env.CHAIN_ID),
            to: address,
            from: account,
            data: tx,
        }
        console.log("Signing transaction...");
        const txData = await web3.eth.accounts.signTransaction(txObject, privateKey);

        console.log("Sending transaction...");
        const transactionHash = await web3.eth.sendSignedTransaction(txData.rawTransaction);
        const receipt = await web3.eth.getTransactionReceipt(transactionHash.transactionHash);
        console.log("Transaction sent!");

        return {
            status: true,
            message: receipt.status,
        };
    } catch (err) {
        console.log("Error sending transaction");
        // console.log(err);
        return {
            status: false,
            message: err.message
        }
    }
}


// (async () => {
//     const data = {
//         test: "test..",
//         abc: "abc",
//     }
//     console.log(await verifyObj(data));
//     await createCert(data);
//     console.log(await verifyObj(data));
// })().then(() => {
//     console.log("Done...");
// }).catch(err => {
//     console.log("Error...");
//     console.log(err);
// })

module.exports = {
    verifyObj,
    createCert,
}
