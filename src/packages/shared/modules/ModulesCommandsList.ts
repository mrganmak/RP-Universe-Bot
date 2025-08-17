import { OpenTicketInput, OpenTicketOutput } from "@src/index.js"

export type ModulesCommandsList = {
	'Ticket.Open': { In: OpenTicketInput, Out: OpenTicketOutput }
}
