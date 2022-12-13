import { Chain, types } from 'https://deno.land/x/clarinet@v1.0.6/index.ts';
import { readOnlyCall, transactionCall } from './base.ts'

const launchData = {
    title: types.utf8("ClearFund Campaign"),
    description: types.buff("Crowdfunding"),
    link: types.utf8("https://launch.campaign"),
    fundGoal: types.uint(20000),
    startsAt: types.uint(10),
    endsAt: types.uint(50)
}

let launchArguments = [
    launchData.title,
    launchData.description,
    launchData.link,
    launchData.fundGoal,
    launchData.startsAt,
    launchData.endsAt
]

const pledgeData = {
    campaignId: types.uint(1),
    amount: types.uint(1000)
}

const unpledgeData = {
    campaignId: types.uint(1),
    amount: types.uint(500)
}

// launch functions
export function launch(sender: string) {
    return transactionCall(sender, "clearfund", "launch", launchArguments)
}

// pledge functions
export function pledge(sender: string) {
    return transactionCall(sender, "clearfund", "pledge", [pledgeData.campaignId, pledgeData.amount])
}

export function pledgeAmountEmpty(sender: string) {
    return transactionCall(sender, "clearfund", "pledge", [pledgeData.campaignId, types.uint(0)])
}

export function pledgeAmountLessThan500(sender: string) {
    return transactionCall(sender, "clearfund", "pledge", [pledgeData.campaignId, types.uint(499)])
}

export function pledgeAmountGreaterThanGoal(sender: string) {
    return transactionCall(sender, "clearfund", "pledge", [pledgeData.campaignId, types.uint(20000)])
}

// unpledge functions
export function unpledge(sender: string) {
    return transactionCall(sender, "clearfund", "unpledge", [unpledgeData.campaignId, unpledgeData.amount])
}

export function unpledgeAll(sender: string) {
    return transactionCall(sender, "clearfund", "unpledge", [unpledgeData.campaignId, pledgeData.amount])
}

export function unpledgeMoreThanPledged(sender: string) {
    return transactionCall(sender, "clearfund", "unpledge", [unpledgeData.campaignId, types.uint(1200)])
}

// refund functions
export function refund(sender: string) {
    return transactionCall(sender, "clearfund", "refund", [unpledgeData.campaignId])
}

// read-only functions
export function getCampaign(chain: Chain, sender: string) {
    return readOnlyCall(chain, sender, "clearfund", "get-campaign", [pledgeData.campaignId])
}

export function getInvestment(chain: Chain, sender: string) {
    return readOnlyCall(chain, sender, "clearfund", "get-investment", [pledgeData.campaignId, types.principal(sender)])
}
