"use strict"; // Enforce stricter parsing and error handling in JavaScript

// Require necessary modules
const FabricCAServices = require("fabric-ca-client"); // CA client for registering and enrolling users
const { Wallets } = require("fabric-network"); // Wallet management for storing identities
const fs = require("fs"); // File system operations
const path = require("path"); // Path resolution

// Main asynchronous function to handle registration and enrollment of a new user
async function main() {
  try {
    // Resolve the path to the connection profile for the organization
    const ccpPath = path.resolve(__dirname, "fabric", "connection-org1.json");
    const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8")); // Parse the connection profile

    // Extract CA details from the connection profile
    const caInfo = ccp.certificateAuthorities["ca.org1.example.com"];
    const ca = new FabricCAServices(caInfo.url); // Instantiate a new CA service

    // Define the path to the wallet where identities will be stored
    const walletPath = path.join(process.cwd(), "wallet");
    const wallet = await Wallets.newFileSystemWallet(walletPath); // Create a new file system wallet

    // Check if the 'appUser' identity already exists in the wallet
    const userIdentity = await wallet.get("appUser");
    if (userIdentity) {
      console.log(
        'An identity for the user "appUser" already exists in the wallet'
      );
      return; // Exit the function if the identity already exists
    }

    // Check if the 'admin' identity exists in the wallet
    const adminIdentity = await wallet.get("admin");
    if (!adminIdentity) {
      console.log(
        'An identity for the admin user "admin" does not exist in the wallet'
      );
      console.log("Run the enrollAdmin.js application before retrying");
      return; // Exit the function if the admin identity does not exist
    }

    // Get the provider for the admin identity
    const provider = wallet
      .getProviderRegistry()
      .getProvider(adminIdentity.type);
    // Get the admin user context
    const adminUser = await provider.getUserContext(adminIdentity, "admin");

    // Register the new user with the CA
    const secret = await ca.register(
      {
        affiliation: "org1.department1", // Affiliation string
        enrollmentID: "appUser", // Enrollment ID for the new user
        role: "client", // Role assigned to the new user
      },
      adminUser
    );

    // Enroll the new user with the CA using the secret obtained during registration
    const enrollment = await ca.enroll({
      enrollmentID: "appUser",
      enrollmentSecret: secret,
    });

    // Prepare the X.509 identity object for the new user
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate, // Certificate
        privateKey: enrollment.key.toBytes(), // Private key
      },
      mspId: "Org1MSP", // MSP ID
      type: "X.509", // Identity type
    };

    // Store the new user's identity in the wallet
    await wallet.put("appUser", x509Identity);
    console.log(
      'Successfully registered and enrolled admin user "appUser" and imported it into the wallet'
    );
  } catch (error) {
    console.error(`Failed to register user "appUser": ${error}`);
    process.exit(1); // Exit the process with an error code
  }
}

// Call the main function
main();
