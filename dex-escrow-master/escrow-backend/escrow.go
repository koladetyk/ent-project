// Smart contract function for creating an escrow
func (s *SmartContract) CreateEscrow(ctx contractapi.TransactionContextInterface, escrowId string, buyer string, seller string, amount string) error {
    escrow := Escrow{
        Buyer:  buyer,
        Seller: seller,
        Amount: amount,
        Status: "created",
    }
    escrowJSON, err := json.Marshal(escrow)
    if err != nil {
        return err
    }
    return ctx.GetStub().PutState(escrowId, escrowJSON)
}

// Smart contract function for releasing an escrow
func (s *SmartContract) ReleaseEscrow(ctx contractapi.TransactionContextInterface, escrowId string) error {
    escrowJSON, err := ctx.GetStub().GetState(escrowId)
    if err != nil {
        return err
    }
    if escrowJSON == nil {
        return fmt.Errorf("escrow %s does not exist", escrowId)
    }

    var escrow Escrow
    err = json.Unmarshal(escrowJSON, &escrow)
    if err != nil {
        return err
    }

    escrow.Status = "released"
    updatedEscrowJSON, err := json.Marshal(escrow)
    if err != nil {
        return err
    }
    return ctx.GetStub().PutState(escrowId, updatedEscrowJSON)
}