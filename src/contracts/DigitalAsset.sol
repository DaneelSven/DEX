pragma solidity ^0.5.0;

import "node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";


contract DigitalAsset {
    using SafeMath for uint;

    // Variables of our digital asset
    string public name = "Digital Asset";
    string public symbol = "DA";
    uint256 public decimals = 18;
    uint256 public totalSupply;
    // mappings are key value datastructures
    mapping(address => uint256) public balanceOfAddress;
    // first address is the address of the person who approved the tokens and key is a
    // mapping of all the places they have approved the tokens to be spended.
    // second mapping the addresses are the exchanges and the amount of tokens in them.
    mapping(address => mapping(address => uint256)) public allowanceOfTransfer;

    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);




    // Setting the total supply and giving all the tokens to the address who deployed this smart contract
    constructor() public {
        totalSupply = 1000000 * (10 ** decimals);
        balanceOfAddress[msg.sender] = totalSupply;
    }

    // transfer function which transfers tokens to an specific address and emits a Transfer event.
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(_to != address(0), "You have entered an invalid address!");
        _transfer(msg.sender, _to, _value);
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    // internal transfer function which is used in transferFrom function, cannot be called outside of this smart contract.
    function _transfer(address _from, address _to, uint256 _value) internal {
        require(_to != address(0), "You have entered an invalid address!");
        balanceOfAddress[_from] = balanceOfAddress[_from].sub(_value);
        balanceOfAddress[_to] = balanceOfAddress[_to].add(_value);
        emit Transfer(_from, _to, _value);
    }

    // approve function which you can approve a 3rd party to spend your tokens
    function approve(address _spender, uint256 _value) public returns (bool success) {
        require(_spender != address(0), "You have entered an invalid address!");
        allowanceOfTransfer[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    // transfer function which specifies from what address to what address to transfer tokens
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_value <= balanceOfAddress[_from], "You cannot spend more tokens than you have in your wallet!");
        require(_value <= allowanceOfTransfer[_from][msg.sender], "You cannot spend more tokens than you are approved to!");
        allowanceOfTransfer[_from][msg.sender] = allowanceOfTransfer[_from][msg.sender].sub(_value);
        _transfer(_from, _to, _value);
        return true;
    }
}