pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./TixicoToken.sol";

contract Evvent {
    using SafeMath for uint256;
    // Ticket structure
    struct Ticket {
        address owner;
        string category;
        bool burned;
        bool listed;
        bool initialized;
        uint256 id;
        uint256 listingIndex;
        uint256 row;
        uint256 seat;
        uint256 price;
        uint256 index;
    }

    // events
    event LogTicketRegistered(uint256 ticketId, address buyer, uint256 price);
    event LogTicketSwapped(uint256 ticketId, address seller, address buyer, uint256 price);
    event LogTicketBurned(uint256 ticketId, address attendee);
    event LogTicketListed(uint256 ticketId, uint256 price, address owner);
    event LogEventCreated(address owner);
    // mappings
    mapping (address => uint256[]) ownerTickets;
    mapping (uint256 => Ticket) tickets;
    mapping (string => uint256) categories;
    // variables
    address public owner;
    uint256 public ticketCount = 9999;
    uint256 categoryCount = 0;
    uint256 public boughtCount = 0;
    uint256 maxResellPrice = 99999999;
    uint256 ownersCut = 1;
    uint256 eventTime;
    uint256 revenue = 0;
    ERC20 public tixicoToken;
    // lists, arrays
    uint256[] listedTicketIds;

    // @notice constructor
    // @param _ticketCount is the maximum count of tickets that can be distirbuted with this contract
    // @param _maxResellPrice is the price ceiling for ticket reselling
    // @param _name name of the event
    // @param _eventTime the date of the event as seconds(unix timestamp)
    function Evvent(uint256 _ticketCount, uint256 _maxResellPrice, uint256 _eventTime, ERC20 _tixicoToken) public {
        owner = msg.sender;
        eventTime = _eventTime;
        ticketCount = _ticketCount;
        maxResellPrice = _maxResellPrice;
        tixicoToken = _tixicoToken;

        emit LogEventCreated(owner);
    }

    // @notice creates a new ticket in the event (aka the user buys a ticket)
    // @param categoryName is the name(id) of the category
    // @param row is the row of the chair
    // @param seat is the number of the chair
    // @return created ticket id
    // @todo add onlyOwner modifier
    function createTicket(string categoryName, uint256 row, uint256 seat, uint256 ticketId) public returns (uint256) {
        require(revenue + categories[categoryName] >= revenue);
        require(boughtCount < ticketCount);
        require(!tickets[ticketId].initialized);
        require(categories[categoryName] > 0);
        require(tixicoToken.balanceOf(msg.sender) >= categories[categoryName]);

        boughtCount = boughtCount.add(1);
        revenue = revenue.add(categories[categoryName]);
        tickets[ticketId].category = categoryName;
        tickets[ticketId].owner = msg.sender;
        tickets[ticketId].initialized = true;
        tickets[ticketId].id = ticketId;
        tickets[ticketId].row = row;
        tickets[ticketId].seat = seat;
        tickets[ticketId].index = ownerTickets[msg.sender].length;
        ownerTickets[msg.sender].push(ticketId);

        // ETH transfer
        // owner.transfer(categories[categoryName]);
        // ERC20 transfer
        require(tixicoToken.transferFrom(msg.sender, owner, categories[categoryName]));

        emit LogTicketRegistered(tickets[ticketId].id, tickets[ticketId].owner, categories[categoryName]);

        return ticketId;
    }

    // @notice fallback payable function that just throws
    function () external payable {
        revert();
    }

    // @notice returns array of all ticket ids for a user
    // @param tOwner is the address of ticket owner
    // @return array with ticket ids
    function getTicketIds(address tOwner) public constant returns(uint256[] ticketIds) {
        require(ownerTickets[tOwner].length > 0);
        return ownerTickets[tOwner];
    }

    // @notice function to check how many tickets are left
    // @return number of tickets left for purchase
    function ticketsLeft() public constant returns(uint256) {
        require(ticketCount > boughtCount);
        return ticketCount.sub(boughtCount);
    }

    // @notice gets main information about a ticket
    // @param ticketId the id of the ticket
    // @return set of most important parameters
    function getTicketInformation(uint256 ticketId) public constant returns(string, bool, bool, uint256, uint256, uint256) {
        require(tickets[ticketId].initialized);
        return (tickets[ticketId].category, tickets[ticketId].burned, tickets[ticketId].listed, tickets[ticketId].price, tickets[ticketId].row, tickets[ticketId].seat);
    }

    // @notice function to list tickets on the secondary market
    // @param ticketId is the id of the ticket
    // @param price is the desired price for the ticket
    // @return the ticket id that was listed on the secondary market
    function listTicket(uint256 ticketId, uint256 price) public returns (uint256) {
        require(tickets[ticketId].initialized);
        require(!tickets[ticketId].burned);
        require(!tickets[ticketId].listed);
        require(tickets[ticketId].owner == msg.sender);
        require(price > 0);
        require(price < categories[tickets[ticketId].category].mul(2));

        tickets[ticketId].price = price;
        tickets[ticketId].listed = true;
        tickets[ticketId].listingIndex = listedTicketIds.length;
        listedTicketIds.push(ticketId);

        emit LogTicketListed(ticketId, price, msg.sender);

        return ticketId;
    }

    // @notice function to get the tickets available on the secondary market
    // @return uint256 array of available ticket ids
    function getListedTicketIds() public constant returns(uint256[] listedIds) {
        require(listedTicketIds.length > 0);
        return listedTicketIds;
    }

    // @notice function for secondary market ticket swapping
    // @param _ticketId the id of the sellable ticket
    // @return the id of the same ticket
    function swapTicket(uint256 ticketId) public returns (uint256) {
        require(tickets[ticketId].initialized);
        require(!tickets[ticketId].burned);
        require(tickets[ticketId].listed);
        require(tixicoToken.balanceOf(msg.sender) >= tickets[ticketId].price);
        require(msg.sender != tickets[ticketId].owner);

        address seller = tickets[ticketId].owner;
        uint256 lastOwnerIndex = ownerTickets[msg.sender].length - 1;
        uint256 lastListingIndex = listedTicketIds.length - 1;
        uint256 ownerIndex = tickets[ticketId].index;
        uint256 listingIndex = tickets[ticketId].listingIndex;


        // delete ownerTickets[seller][ownerIndex];
        ownerTickets[seller][ownerIndex] = ownerTickets[seller][lastOwnerIndex];
        tickets[ownerTickets[seller][ownerIndex]].index = ownerIndex;
        ownerTickets[seller].length--;

        tickets[ticketId].index = ownerTickets[msg.sender].length;
        tickets[ticketId].owner = msg.sender;
        tickets[ticketId].listed = false;
        ownerTickets[msg.sender].push(ticketId);

        // delete listedTicketIds[listingIndex];
        listedTicketIds[listingIndex] = listedTicketIds[lastListingIndex];
        tickets[listedTicketIds[listingIndex]].listingIndex = listingIndex;
        listedTicketIds.length--;

        // TODO: add owners cut functionality
        require(tixicoToken.transferFrom(msg.sender, seller, tickets[ticketId].price));

        emit LogTicketSwapped(ticketId, seller, msg.sender, tickets[ticketId].price);

        return ticketId;
    }

    // @notice burns the ticket, always invoked by the user
    // @param ticketId the id of the ticket the user wants to burn
    // @return the id of the burned ticket
    function burnTicket(uint256 ticketId) public returns (uint256) {
        Ticket storage ticket = tickets[ticketId];
        require(ticket.initialized);
        require(!ticket.burned);
        require(!ticket.listed);
        require(ticket.owner == msg.sender);

        ticket.burned = true;

        emit LogTicketBurned(ticketId, msg.sender);

        return ticketId;
    }

    // @notice creates a new ticket category
    // @param basePrice is the base price of that category
    // @param name is the name for the category
    // @return price of newly created category
    // @todo require category not present
    function createCategory(string categoryName, uint256 basePrice) public returns (uint256) {
        require(owner == msg.sender);
        categoryCount = categoryCount.add(1);
        categories[categoryName] = basePrice;

        return categories[categoryName];
    }

    // @notice gets price of category
    // @param categoryName is the name of the category
    // @return the price of the category
    function getCategoryPrice(string categoryName) public constant returns (uint256) {
        return categories[categoryName];
    }
}
