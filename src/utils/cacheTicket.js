function cacheTicket(ticket, key, account) {
  let ticketList = []
  if (localStorage.getItem(`${key}-${account}`)) {
    ticketList = JSON.parse(localStorage.getItem(`${key}-${account}`))
  }
  ticketList.push(ticket)
  localStorage.setItem(`${key}-${account}`, JSON.stringify(ticketList))
}

export default cacheTicket
