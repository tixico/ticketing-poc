function syncTickets(key, account, that, ticketArray=[]) {
  let tickets = ticketArray.length > 0 ? ticketArray : that.state.ticketIds
  const cachedTickets = JSON.parse(localStorage.getItem(`${key}-${account}`))
  if (!cachedTickets) return false
  const currentTime = new Date().getTime()
  let updatedCachedTickets = cachedTickets.filter(ticket => (!tickets.includes(ticket.id) && (ticket.created + 600000 > currentTime)))
  that.setState({
    cachedTicketIds: updatedCachedTickets.map(ticket => ticket.id)
  })
  localStorage.setItem(`${key}-${account}`, JSON.stringify(updatedCachedTickets))
}

export default syncTickets
