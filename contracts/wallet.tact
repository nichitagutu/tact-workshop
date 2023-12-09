import "@stdlib/deploy";

/*
    +------------------------+------+-------------------------------------------------------+
    | Name                   | Mode | Description                                           |
    +------------------------+------+-------------------------------------------------------+
    | SendPayGasSeparately   | 1    | Pay transfer fees separately from the message value   |
    +------------------------+------+-------------------------------------------------------+
    | SendIgnoreErrors       | 2    | Ignore any errors arising while processing this       |
    |                        |      | message during the action phase                       |
    +------------------------+------+-------------------------------------------------------+
    | SendDestroyIfZero      | 32   | Current account must be destroyed if its resulting    |
    |                        |      | balance is zero (often used with Mode 128)            |
    +------------------------+------+-------------------------------------------------------+
    | SendRemainingValue     | 64   | Carry all the remaining value of the inbound message  |
    |                        |      | in addition to the value initially indicated in the   |
    |                        |      | new message                                           |
    +------------------------+------+-------------------------------------------------------+
    | SendRemainingBalance   | 128  | Carry all the remaining balance of the current smart  |
    |                        |      | contract instead of the value originally indicated in |
    |                        |      | the message                                           |
    +------------------------+------+-------------------------------------------------------+
*/

// task: implement a receive handler that will allow to send funds to the given address. amount and receiver address (to) should be passed in a message

message Withdraw {
    amount: Int as coins;
}

contract Wallet with Deployable {

    const MinTonForStorage: Int = ton("0.01"); // enough for 1 KB of storage for 2.5 years
    deployer: Address;

    init() {
        self.deployer = sender();
    }

    // accept incoming TON transfers
    receive() {
        dump("funds received");
    }

    // this will withdraw the entire balance of the contract and leave 0
    receive("withdraw all") {
        require(sender() == self.deployer, "Only deployer is allowed to withdraw");
        send(SendParameters{
            to: sender(),
            bounce: true,
            value: 0,
            mode: SendRemainingBalance + SendIgnoreErrors
        });
    }

    // this will withdraw the entire balance but leave 0.01 for storage rent costs
    receive("withdraw safe") {
        require(sender() == self.deployer, "Only deployer is allowed to withdraw");
        send(SendParameters{
            to: sender(),
            bounce: true,
            value: myBalance() - context().value - self.MinTonForStorage,
            mode: SendRemainingValue + SendIgnoreErrors
        });
    }
 
    get fun balance(): String {
        return myBalance().toCoinsString();
    }
}
