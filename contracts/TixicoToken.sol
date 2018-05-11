pragma solidity ^0.4.19;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import 'zeppelin-solidity/contracts/token/ERC20/MintableToken.sol';

contract TixicoToken is MintableToken {
    string public name = "Tixico";
    string public symbol = "TXC";
    uint public decimals = 18;
}
