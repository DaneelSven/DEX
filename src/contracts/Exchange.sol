pragma solidity ^0.5.0;

import "./DigitalAsset.sol";
import "node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";


contract Exchange {
    using SafeMath for uint;

    // Variables
    address public feeAccount; // the account that receives exchange fees
    uint256 public feePercent; // the fee percentage
    address constant ETHER = address(0); // store Ether in tokens mapping with blank address
    
    //first key is the token the second key is the user address
    mapping(address => mapping(address => uint256)) public tokens;

    // Events for depositing and withrawing tokens
    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(address token, address user, uint amount, uint balance);

    constructor (address _feeAccount, uint256 _feePercent) public {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    // Fallback: reverts if Ether is sent to this smart contract by mistake
    function() external {
        revert("");
    }

    function depositEther() public payable  {
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].add(msg.value);
        emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
    }

    function withdrawEther(uint _amount) public {
        require(tokens[ETHER][msg.sender] >= _amount, "");
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].sub(_amount);
        msg.sender.transfer(_amount);
        emit Withdraw(ETHER, msg.sender, _amount, tokens[ETHER][msg.sender]);
    }

    // function that deposits tokens
    function depositToken(address _token, uint _amount) public {
        require(_token != ETHER, "");
        require(DigitalAsset(_token).transferFrom(msg.sender, address(this), _amount), "");
        tokens[_token][msg.sender] = tokens[_token][msg.sender].add(_amount);
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function withdrawToken(address _token, uint256 _amount) public {
        require(_token != ETHER,"");
        require(tokens[_token][msg.sender] >= _amount, "");
        tokens[_token][msg.sender] = tokens[_token][msg.sender].sub(_amount);
        require(DigitalAsset(_token).transfer(msg.sender, _amount), "");
        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function balanceOf(address _token, address _user) public view returns (uint256) {
        return tokens[_token][_user];
    }
}