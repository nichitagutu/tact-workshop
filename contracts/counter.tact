import "@stdlib/deploy";

// fix the bug in the increment handler
// add handler for decrement message

contract Counter with Deployable {
 
    // persistent state variable of type Int to hold the counter value
    val: Int as uint32;
 
    // initialize the state variable when contract is deployed
    init() {
        self.val = 0;
    }
 
    // handler for incoming increment messages that increments the counter value by 1
    receive("increment") {
        self.val = self.val;
    }
 
    // read-only getter for querying the counter value
    get fun value(): Int {
        return self.val;
    }
}
