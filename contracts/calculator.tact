import "@stdlib/deploy";

// declare GreaterThen message
// declare GreaterThenResult message
// implement GreaterThen message handler (x > y)

message Add {
    x: Int as int32;
    y: Int as int32;
}

message Subtract {
    x: Int as int32;
    y: Int as int32;
}

message MathResult {
    result: Int as int32;
}

contract Calculator with Deployable {

    lastResult: Int as int32;

    init() {
        self.lastResult = 0;
    }

    receive(msg: Add) {
        let result: Int = msg.x + msg.y;

        self.writeToLastResult(result);

        self.reply(MathResult{result: result}.toCell());
    }

    receive(msg: Subtract) {
        let result: Int = msg.x - msg.y;

        self.writeToLastResult(result);

        self.reply(MathResult{result: result}.toCell());
    }

    get fun getLastResult(): Int {
        return self.lastResult;
    }

    fun writeToLastResult(value: Int) {
        self.lastResult = value;
    }
}
