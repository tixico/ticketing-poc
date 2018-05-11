pragma solidity ^0.4.19;

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import 'zeppelin-solidity/contracts/crowdsale/emission/MintedCrowdsale.sol';
import 'zeppelin-solidity/contracts/token/ERC20/MintableToken.sol';

contract TixicoFaucet is MintedCrowdsale {
    mapping (address => uint) balances;
    event LogTokensTransferred(address demander);

    function TixicoFaucet(uint256 _rate, address _wallet, MintableToken _token) public Crowdsale(_rate, _wallet, _token) {}

    function receiveTokens() public {
        require(balances[msg.sender] < 200);

        balances[msg.sender] = balances[msg.sender].add(100);
        _processPurchase(msg.sender, 100);

        emit LogTokensTransferred(msg.sender);
    }
}
