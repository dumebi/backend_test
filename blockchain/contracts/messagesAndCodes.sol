pragma solidity >=0.4.0 <0.6.0;

library MessagesAndCodes {
    string public constant EMPTY_MESSAGE_ERROR = "Message cannot be empty string";
    string public constant CODE_RESERVED_ERROR = "Given code is already pointing to a message";
    string public constant CODE_UNASSIGNED_ERROR = "Given code does not point to a message";

    struct Data {
        mapping (uint8 => string) messages;
        uint8[] codes;
    }

    function messageIsEmpty (string memory _message) internal pure returns (bool isEmpty){
        isEmpty = bytes(_message).length == 0;
    }

    function messageExists (Data storage self, uint8 _code) internal view returns (bool exists){
        exists = bytes(self.messages[_code]).length > 0;
    }

    function _addMessage (Data storage self, uint8 _code, string memory _message) internal returns (uint256 code){
        require(!messageIsEmpty(_message), EMPTY_MESSAGE_ERROR);
        require(!messageExists(self, _code), CODE_RESERVED_ERROR);
        // enter message at code and push code onto storage
        self.messages[_code] = _message;
        uint256 codeIndex = self.codes.push(_code);
        return codeIndex;
    }

    function _removeMessage (Data storage self, uint256 codeIndex, uint8 _code) internal returns (bool) {
        require(messageExists(self, _code), CODE_UNASSIGNED_ERROR);
        // remove code from storage by shifting codes in array
        for (uint256 i = codeIndex; i < self.codes.length - 1; i++) {
            self.codes[i] = self.codes[i + 1];
        }
        self.codes.length--;
        // remove message from storage
        self.messages[_code] = "";
        return true;
    }

    function _updateMessage (Data storage self, uint8 _code, string memory _message) internal returns (bool){
        require(!messageIsEmpty(_message), EMPTY_MESSAGE_ERROR);
        require(messageExists(self, _code), CODE_UNASSIGNED_ERROR);
        // update message at code
        self.messages[_code] = _message;
        return true;
    }

    function stringsEqual(string memory _a, string memory _b) public pure returns(bool){
        if (keccak256(abi.encode(_a)) == keccak256(abi.encode(_b))) {
            return true;
        }
        return false;
    }
}