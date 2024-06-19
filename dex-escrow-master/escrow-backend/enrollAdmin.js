"use strict";

// Import required modules
const FabricCAServices = require("fabric-ca-client"); // CA services for enrolling identities
const { Wallets } = require("fabric-network"); // Wallet management for storing identities
const fs = require("fs"); // File system module for reading connection profile
const path = require("path"); // Path module for handling file paths

/**
 * Main function that orchestrates the enrollment of an admin user.
 */
async function main() {
  try {
    // Resolve the path to the connection profile for Org1
    const ccpPath = path.resolve(__dirname, "fabric", "connection-org1.json");
    // Read and parse the connection profile
    const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

    // Extract CA details from the connection profile
    const caInfo = ccp.certificateAuthorities["ca.org1.example.com"];
    // Create a new instance of FabricCAService using the CA URL
    const ca = new FabricCAServices(caInfo.url);

    // Define the path to the wallet where identities will be stored
    const walletPath = path.join(process.cwd(), "wallet");
    // Initialize a new file system wallet at the specified path
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    // Attempt to retrieve the admin identity from the wallet
    const adminIdentity = await wallet.get("admin");
    // Check if the admin identity already exists
    if (adminIdentity) {
      console.log(
        'An identity for the admin user "admin" already exists in the wallet'
      );
      return; // Exit the function early since the admin identity already exists
    }

    // Enroll the admin user with the CA
    const enrollment = await ca.enroll({
      enrollmentID: "admin",
      enrollmentSecret: "adminpw",
    });

    // Prepare the X.509 identity object for the admin user
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: "Org1MSP", // Specify the MSP ID associated with the identity
      type: "X.509", // Type of the identity
    };

    // Store the admin identity in the wallet
    await wallet.put("admin", x509Identity);
    console.log(
      'Successfully enrolled admin user "admin" and imported it into the wallet'
    );
  } catch (error) {
    console.error(`Failed to enroll admin user "admin": ${error}`);
    process.exit(1); // Exit the process with an error code
  }
}

// Call the main function to execute the script
main();
