// Import required modules
const express = require("express"); // Express framework for building web applications
const bodyParser = require("body-parser"); // Middleware to parse incoming request bodies
const { Gateway, Wallets } = require("fabric-network"); // Hyperledger Fabric networking components
const path = require("path"); // Node.js module for handling file paths
const fs = require("fs"); // Node.js module for interacting with the file system

// Initialize Express application
const app = express();

// Define the port the server will run on, defaulting to 3000 if no environment variable is set
const PORT = process.env.PORT || 3000;

// Use body-parser middleware to parse JSON bodies
app.use(bodyParser.json());

// Define the path to the connection profile for the organization
const ccpPath = path.resolve(__dirname, "fabric", "connection-org1.json");

// Define the path to the wallet directory
const walletPath = path.join(process.cwd(), "wallet");

// Function to establish a connection to the Hyperledger Fabric network and retrieve the smart contract
async function getContract() {
  // Read the connection profile
  const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

  // Create a new file system wallet
  const wallet = await Wallets.newFileSystemWallet(walletPath);

  // Instantiate a new gateway
  const gateway = new Gateway();

  // Connect to the gateway using the connection profile, wallet, and identity
  await gateway.connect(ccp, {
    wallet,
    identity: "appUser",
    discovery: { enabled: true, asLocalhost: true },
  });

  // Get the network channel
  const network = await gateway.getNetwork("mychannel");

  // Retrieve the smart contract from the network
  const contract = network.getContract("mycc");

  // Return the contract instance
  return contract;
}

// Endpoint to create an escrow transaction
app.post("/createEscrow", async (req, res) => {
  try {
    // Extract parameters from the request body
    const { escrowId, buyer, seller, amount } = req.body;

    // Obtain the contract instance
    const contract = await getContract();

    // Submit the transaction to create an escrow
    await contract.submitTransaction(
      "createEscrow",
      escrowId,
      buyer,
      seller,
      amount
    );

    // Send a success message
    res.send("Escrow created successfully");
  } catch (error) {
    // Log the error
    console.error(`Failed to create escrow: ${error}`);

    // Send an error response
    res.status(500).send(`Failed to create escrow: ${error}`);
  }
});

// Endpoint to release an escrow transaction
app.post("/releaseEscrow", async (req, res) => {
  try {
    // Extract the escrow ID from the request body
    const { escrowId } = req.body;

    // Obtain the contract instance
    const contract = await getContract();

    // Submit the transaction to release the escrow
    await contract.submitTransaction("releaseEscrow", escrowId);

    // Send a success message
    res.send("Escrow released successfully");
  } catch (error) {
    // Log the error
    console.error(`Failed to release escrow: ${error}`);

    // Send an error response
    res.status(500).send(`Failed to release escrow: ${error}`);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
