function removeTicket(ticket, key, account) {
  let ticketList = []
  if (localStorage.getItem(`${key}-${account}`)) {
    ticketList = JSON.parse(localStorage.getItem(`${key}-${account}`))
  }
  let updatedTicketList = ticketList.filter(t => ticket.id !== t.id)
  localStorage.setItem(`${key}-${account}`, JSON.stringify(updatedTicketList))
}

export default removeTicket
