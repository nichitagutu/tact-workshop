import "@stdlib/deploy";

// Change the code below from "hello world" to "hello tact"

contract HelloWorld with Deployable {
    init() {
        // do nothing
    }

    get fun greeting(): String {
        return "hello world";
    }
}
