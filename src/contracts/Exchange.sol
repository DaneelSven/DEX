pragma solidity ^0.5.0;

import "./DigitalAsset.sol";
import "node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";


contract Exchange {
    using SafeMath for uint;

    // Variables
    address public feeAccount; // the account that receives exchange fees
    uint256 public feePercent; // the fee percentage
    uint256 public orderCount; // counts the amount of orders
    address constant ETHER = address(0); // store Ether in tokens mapping with blank address

    //first key is all the tokens that have been deposited,
    // the second key is the address of the user who has deposited the tokens themselfs
    mapping(address => mapping(address => uint256)) public tokens;
    mapping(uint256 => _Order) public orders;
    mapping(uint256 => bool) public orderCancelled;
    mapping(uint256 => bool) public orderFilled;


    // Events for depositing and withrawing tokens
    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(address token, address user, uint amount, uint balance);
    event Order(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );
    event Cancel(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );
    event Trade(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        address userFill,
        uint256 timestamp
    );

    //solitity allows you to create an own datatype with structs
    struct _Order {
        uint256 id;
        address user;
        address tokenGet;
        uint256 amountGet;
        address tokenGive;
        uint256 amountGive;
        uint256 timestamp;
    }

    constructor (address _feeAccount, uint256 _feePercent) public {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    // Fallback: reverts if Ether is sent to this smart contract by mistake
    function() external {
        revert("");
    }

    // function that deposits ether to the exchange address and is payable which means it accepts Ether and can use the metadata
    function depositEther() public payable  {
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].add(msg.value);
        emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
    }

    // function that withdraws ether from the exchange address
    function withdrawEther(uint _amount) public {
        require(tokens[ETHER][msg.sender] >= _amount, "");
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].sub(_amount);
        msg.sender.transfer(_amount);
        emit Withdraw(ETHER, msg.sender, _amount, tokens[ETHER][msg.sender]);
    }

    // function that deposits tokens to the exchange wallet
    function depositToken(address _token, uint _amount) public {
        require(_token != ETHER, "");
        require(DigitalAsset(_token).transferFrom(msg.sender, address(this), _amount), "");
        tokens[_token][msg.sender] = tokens[_token][msg.sender].add(_amount);
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    // function that withdraws tokens from the exchange address
    function withdrawToken(address _token, uint256 _amount) public {
        require(_token != ETHER,"You can't withdraw ether only the token");
        require(tokens[_token][msg.sender] >= _amount, "");
        tokens[_token][msg.sender] = tokens[_token][msg.sender].sub(_amount);
        require(DigitalAsset(_token).transfer(msg.sender, _amount), "");
        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    // function to return user balance
    function balanceOf(address _token, address _user) public view returns (uint256) {
        return tokens[_token][_user];
    }

    // function that initiates an order and adds it into the order mapping
    function makeOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) public {
        orderCount = orderCount.add(1);
        orders[orderCount] = _Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, now);
        emit Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, now);
    }

    // function that can canel orders with an id
    function cancelOrder(uint256 _id) public {
         // fetching the order with the id out of storage on the blockchain and it is of Order type and called order
        _Order storage _order = orders[_id];
        require(address(_order.user) == msg.sender, "You are not allowed to cancel other peoples orders!");
        require(_order.id == _id, "The order must exist!");
        orderCancelled[_id] = true;
        emit Cancel(_order.id, msg.sender, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive, now);
    }

    //
    function fillOrder(uint256 _id) public {
        require(_id > 0 && _id <= orderCount, "The order id must be valid");
        require(!orderFilled[_id], "The order has already been filles");
        require(!orderCancelled[_id], "The order has already been canceled");
        _Order storage _order = orders[_id];
        _trade(_order.id, _order.user, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive);
        orderFilled[_order.id] = true;
    }

    // internal function that excecutes the trade and changes balances of the according addresses and gives the fee to the exchange
    function _trade(uint256 _orderId, address _user, address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) internal {
        // Fee paid by the user that fills the order, a.k.a. msg.sender.
        uint256 _feeAmount = _amountGive.mul(feePercent).div(100);

        tokens[_tokenGet][msg.sender] = tokens[_tokenGet][msg.sender].sub(_amountGet.add(_feeAmount));
        tokens[_tokenGet][_user] = tokens[_tokenGet][_user].add(_amountGet);
        tokens[_tokenGet][feeAccount] = tokens[_tokenGet][feeAccount].add(_feeAmount);
        tokens[_tokenGive][_user] = tokens[_tokenGive][_user].sub(_amountGive);
        tokens[_tokenGive][msg.sender] = tokens[_tokenGive][msg.sender].add(_amountGive);

        emit Trade(_orderId, _user, _tokenGet, _amountGet, _tokenGive, _amountGive, msg.sender, now);
    }
}