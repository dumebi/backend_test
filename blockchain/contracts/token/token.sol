pragma solidity >=0.4.22 <0.6.0;

// ERC Token Standard #20 Interface
// https://github.com/ethereum/EIPs/issues/20
contract ERC20Interface {
    // Get the total token supply
    function totalSupply() view public returns (uint256);

    // Adds to total supply
    function addTotalSupply(uint256 _volume) public;

    // change the rate and currency of the exchange rate of this token
    function changeRate(uint8 _newRate, string memory _newCurrency) public;

    // Get the exchange rate and currency of this token
    function exchangeRate() view public returns (uint8, string memory);

    // Get the account balance of another account with address _owner
    function balanceOf(address _owner) view public returns (uint256);

    // Send _value amount of tokens to address _to
    function transfer(address _to, uint256 _value) public returns (bool success);

    // Send _value amount of tokens from address _from to address _to
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success);

    // Allow _spender to withdraw from your account, multiple times, up to the _value amount.
    // If this function is called again it overwrites the current allowance with _value.
    // this function is required for some DEX functionality
    function approve(address _spender, uint256 _value) public returns (bool success);

    // Returns the amount which _spender is still allowed to withdraw from _owner
    function allowance(address _owner, address _spender) view public returns (uint256 remaining);

    // Triggered when tokens are transferred.
    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    // Triggered whenever approve(address _spender, uint256 _value) is called.
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
}


contract Token is ERC20Interface {
    string public symbol;
    string public name;
    uint8 public constant decimals = 0;
    uint256 _totalSupply;
    uint8 rate;
    string currency;

    // Owner of this contract
    address public owner;

    // Balances for each account
    mapping (address => uint256) balances;

    // Owner of account approves the transfer of an amount to another account
    mapping (address => mapping (address => uint256)) allowed;

    // Functions with this modifier can only be executed by the owner
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    constructor(string memory _symbol, string memory _name, uint256 _supply, uint8 _rate, string memory _currency) public {
        symbol = _symbol;
        name = _name;
        _totalSupply = _supply;
        rate = _rate;
        currency = _currency;
        owner = msg.sender;
        balances[owner] = _supply;
    }

    // What total number of this token in circulation
    function totalSupply() view public returns (uint256) {
        return _totalSupply;
    }

    // increase the total supply of this token in circulation
    function addTotalSupply(uint256 _volume) public {
        _totalSupply += _volume;
    }

    // What is the balance of a particular account?
    function balanceOf(address _owner) view public returns (uint256) {
        return balances[_owner];
    }

    // change the rate and currency of the exchange rate of this token
    function changeRate(uint8 _newRate, string memory _newCurrency) public {
        rate = _newRate;
        currency = _newCurrency;
    }

    // Get the exchange rate and currency of this token
    function exchangeRate() view public returns (uint8, string memory) {
        return (rate, currency);
    }

    // Transfer the balance from owner's account to another account
    function transfer(address _to, uint256 _amount) public returns (bool success) {
        if (balances[msg.sender] >= _amount
        && _amount > 0
        && balances[_to] + _amount > balances[_to]) {
            balances[msg.sender] -= _amount;
            balances[_to] += _amount;
            emit Transfer(msg.sender, _to, _amount);
            return true;
        }
        else {
            return false;
        }
    }

    // Send _value amount of tokens from address _from to address _to
    // The transferFrom method is used for a withdraw workflow, allowing contracts to send
    // tokens on your behalf, for example to "deposit" to a contract address and/or to charge
    // fees in sub-currencies; the command should fail unless the _from account has
    // deliberately authorized the sender of the message via some mechanism; we propose
    // these standardized APIs for approval:
    function transferFrom(
    address _from,
    address _to,
    uint256 _amount
    ) public returns (bool) {
        if (balances[_from] >= _amount
        && allowed[_from][msg.sender] >= _amount
        && _amount > 0
        && balances[_to] + _amount > balances[_to]) {
            balances[_from] -= _amount;
            allowed[_from][msg.sender] -= _amount;
            balances[_to] += _amount;
            emit Transfer(_from, _to, _amount);
            return true;
        }
        else {
            return false;
        }
    }


    // Allow _spender to withdraw from your account, multiple times, up to the _value amount.
    // If this function is called again it overwrites the current allowance with _value.
    function approve(address _spender, uint256 _amount) public returns (bool success) {
        allowed[msg.sender][_spender] = _amount;
        emit Approval(msg.sender, _spender, _amount);
        return true;
    }

    function allowance(address _owner, address _spender) view public returns (uint256 remaining) {
        return allowed[_owner][_spender];
    }

}
