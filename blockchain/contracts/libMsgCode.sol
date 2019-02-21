pragma solidity >=0.4.0 <0.6.0;

library MessagesAndCodes {
    string public constant EMPTY_MESSAGE_ERROR = "Message cannot be empty string";
    string public constant CODE_RESERVED_ERROR = "Given code is already pointing to a message";
    string public constant CODE_UNASSIGNED_ERROR = "Given code does not point to a message";
    
    struct Code {
        mapping(string => uint8) errorStringToCode;
        uint8 currentCodeIndex;
    }
    
    struct Data {
        mapping (uint8 => string) messages;
        Code code;
    }
    
    function init(Data storage self) internal {
        addMessage(self, "SUCCESS", "Transaction was successful!");
    }
    
    function messageIsEmpty (string memory _message) internal pure returns (bool isEmpty) {
        isEmpty = bytes(_message).length == 0;
    }

    function messageExists (Data storage self, uint8 _code) internal view returns (bool exists){
        exists = bytes(self.messages[_code]).length > 0;
    }

    function addMessage (Data storage self, string memory  _errorString, string memory _message) internal returns (string memory errorString) {
        uint8 _code = self.code.currentCodeIndex;
        require(!messageIsEmpty(_message), EMPTY_MESSAGE_ERROR);
        require(!messageExists(self, _code), CODE_RESERVED_ERROR);
        // enter message at code and push code onto storage
        self.messages[_code] = _message;
        self.code.errorStringToCode[_errorString] = _code;
        self.code.currentCodeIndex = _code + 1;
        string memory errorString = _errorString;
        return errorString;
    }

    function removeMessage (Data storage self, string memory _errorString) internal returns (bool success) {
        
        uint8 _code = self.code.errorStringToCode[_errorString];
        require(messageExists(self, _code), CODE_UNASSIGNED_ERROR);
        
        delete self.code.errorStringToCode[_errorString];
        
        // remove message from storage
        delete self.messages[_code];
        success = true;
    }

    function updateMessage (Data storage self, string memory _errorString, string memory _message) internal returns (bool success) {
        uint8 _code = self.code.errorStringToCode[_errorString];
        require(!messageIsEmpty(_message), EMPTY_MESSAGE_ERROR);
        require(messageExists(self, _code), CODE_UNASSIGNED_ERROR);
        // update message at code
        self.messages[_code] = _message;
        success = true;
    }
}