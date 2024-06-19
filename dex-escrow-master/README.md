# Hyperledger Fabric Network Setup

## Issue Explanation

The issue arises because the Docker container name `fabric-peer0.org1.example.com` is already in use by an existing container (`7de348f4e68cbd59acf155110951b03529eda6ac7d4e501f94e3342c63f0c5b5`). Docker does not allow two containers to have the same name, resulting in a conflict that prevents the new container from starting.

## Steps if the Container Starts Successfully

If the peer container (`fabric-peer0.org1.example.com`) starts successfully, follow these steps to set up your Hyperledger Fabric network:

1. **Create a Channel:**

    Use the peer CLI to create a channel. Ensure you have the channel configuration transaction (`channel.tx`) file prepared.

    ```bash
    docker exec -it fabric-peer0.org1.example.com peer channel create -o orderer.example.com:7050 -c mychannel -f /path/to/channel.tx --outputBlock /path/to/mychannel.block
    ```

2. **Join the Peer to the Channel:**

    Join the peer to the newly created channel.

    ```bash
    docker exec -it fabric-peer0.org1.example.com peer channel join -b /path/to/mychannel.block
    ```

3. **Update Anchor Peers:**

    Update the anchor peers for your organization.

    ```bash
    docker exec -it fabric-peer0.org1.example.com peer channel update -o orderer.example.com:7050 -c mychannel -f /path/to/Org1MSPanchors.tx
    ```

4. **Install Chaincode:**

    Install the chaincode on the peer.

    ```bash
    docker exec -it fabric-peer0.org1.example.com peer chaincode install -n mycc -v 1.0 -p github.com/chaincode_example02/go
    ```

5. **Instantiate Chaincode:**

    Instantiate the chaincode on the channel.

    ```bash
    docker exec -it fabric-peer0.org1.example.com peer chaincode instantiate -o orderer.example.com:7050 -C mychannel -n mycc -v 1.0 -c '{"Args":["init","a","100","b","200"]}' -P "OR ('Org1MSP.peer','Org2MSP.peer')"
    ```

6. **Query Chaincode:**

    Query the chaincode to verify it is working correctly.

    ```bash
    docker exec -it fabric-peer0.org1.example.com peer chaincode query -C mychannel -n mycc -c '{"Args":["query","a"]}'
    ```

7. **Invoke Chaincode:**

    Invoke a transaction on the chaincode.

    ```bash
    docker exec -it fabric-peer0.org1.example.com peer chaincode invoke -o orderer.example.com:7050 -C mychannel -n mycc -c '{"Args":["invoke","a","b","10"]}'
    ```

### Screenshots

![Screenshot 1](screenshots/1.png)
![Screenshot 2](screenshots/2.png)
