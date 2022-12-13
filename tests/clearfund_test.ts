
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.6/index.ts';
import { assertEquals, assertStringIncludes } from 'https://deno.land/std@0.90.0/testing/asserts.ts';
import {
    launch,
    pledge,
    pledgeAmountEmpty,
    pledgeAmountLessThan500,
    getCampaign,
    unpledge,
    unpledgeMoreThanPledged,
    unpledgeAll,
    getInvestment,
    refund,
    pledgeAmountGreaterThanGoal
} from '../helpers/clearfund.ts'

function setup() {
    description: "Crowdfunding is a way to raise money for an individual or organization by collecting donations through family, friends, friends of friends, strangers, businesses, and more."
}

// TEST CASES

// LAUNCHING A CAMPAIGN
// a user should be able to launch a new campaign
Clarinet.test({
    name: "A user should be able to launch a new campaign",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const wallet_1 = accounts.get("wallet_1")!.address

        let block = chain.mineBlock([
            Tx.contractCall('clearfund', 'launch', [types.utf8('Test Campaign'), types.buff('This is a campaign that I made.'), types.utf8('https://example.com'), types.uint(10000), types.uint(2), types.uint(100)], wallet_1)
        ]);
        const result = block.receipts[0].result;
        result.expectOk().expectUint(1);
    },
});

// a user should be able to view campaign information
Clarinet.test({
    name: "A user should be able to view campaign information",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const wallet_1 = accounts.get("wallet_1")!.address

        let block = chain.mineBlock([
            Tx.contractCall('clearfund', 'launch', [types.utf8('Test Campaign'), types.buff('This is a campaign that I made.'), types.utf8('https://example.com'), types.uint(10000), types.uint(2), types.uint(100)], wallet_1)
        ]);

        const newCampaign = chain.callReadOnlyFn(
            'clearfund',
            'get-campaign',
            [types.uint(1)],
            wallet_1
        );

        const expectedCampaign = newCampaign.result;
        expectedCampaign.expectOk();
        assertEquals(expectedCampaign, '(ok {campaignOwner: ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5, claimed: false, description: 0x5468697320697320612063616d706169676e20746861742049206d6164652e, endsAt: u100, fundGoal: u10000, link: u"https://example.com", pledgedAmount: u0, pledgedCount: u0, startsAt: u2, targetReached: false, targetReachedBy: u0, title: u"Test Campaign"})');
    },
});

// a user should not be able to launch a campaign with a fundGoal of 0
Clarinet.test({
    name: "a user should not be able to launch a campaign without a fundGoal",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const wallet_1 = accounts.get("wallet_1")!.address

        let block = chain.mineBlock([
            Tx.contractCall('clearfund', 'launch', [types.utf8('Test Campaign'), types.buff('This is a campaign that I made.'), types.utf8('https://example.com'), types.uint(0), types.uint(2), types.uint(100)], wallet_1)
        ]);
        const result = block.receipts[0].result;
        result.expectErr().expectUint(102);
    },
});

// a user should not be able to launch a campaign without a title, description, or link
Clarinet.test({
    name: "a user should not be able to launch a campaign without a title, description, or link",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const wallet_1 = accounts.get("wallet_1")!.address

        let block = chain.mineBlock([
            Tx.contractCall('clearfund', 'launch', [types.utf8(''), types.buff('This is a campaign that I made.'), types.utf8('https://example.com'), types.uint(10000), types.uint(2), types.uint(100)], wallet_1)
        ]);
        const result = block.receipts[0].result;
        result.expectErr().expectUint(101);

        let block2 = chain.mineBlock([
            Tx.contractCall('clearfund', 'launch', [types.utf8('Name'), types.buff(''), types.utf8('https://example.com'), types.uint(10000), types.uint(2), types.uint(100)], wallet_1)
        ]);
        const result2 = block2.receipts[0].result;
        result.expectErr().expectUint(101);

        let block3 = chain.mineBlock([
            Tx.contractCall('clearfund', 'launch', [types.utf8('Name'), types.buff('This is a campaign that I made.'), types.utf8(''), types.uint(10000), types.uint(2), types.uint(100)], wallet_1)
        ]);
        const result3 = block3.receipts[0].result;
        result.expectErr().expectUint(101);
    },
});

// a user should not be able to launch a campaign starting sooner than current block
Clarinet.test({
    name: "a user should not be able to launch a campaign starting sooner than current block",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const wallet_1 = accounts.get("wallet_1")!.address

        let block = chain.mineBlock([
            Tx.contractCall('clearfund', 'launch', [types.utf8('Test Campaign'), types.buff('This is a campaign that I made.'), types.utf8('https://example.com'), types.uint(10000), types.uint(0), types.uint(100)], wallet_1)
        ]);
        const result = block.receipts[0].result;
        result.expectErr().expectUint(103);
    },
});

// a user should not be able to launch a campaign ending sooner than current block
Clarinet.test({
    name: "a user should not be able to launch a campaign ending sooner than current block",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const wallet_1 = accounts.get("wallet_1")!.address

        let block = chain.mineBlock([
            Tx.contractCall('clearfund', 'launch', [types.utf8('Test Campaign'), types.buff('This is a campaign that I made.'), types.utf8('https://example.com'), types.uint(10000), types.uint(5), types.uint(0)], wallet_1)
        ]);
        const result = block.receipts[0].result;
        result.expectErr().expectUint(104);
    },
});

// a user should not be able to launch a campaign ending more than 12960 blocks in the future
Clarinet.test({
    name: "a user should not be able to launch a campaign ending more than 12960 blocks in the future",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const wallet_1 = accounts.get("wallet_1")!.address

        let block = chain.mineBlock([
            Tx.contractCall('clearfund', 'launch', [types.utf8('Test Campaign'), types.buff('This is a campaign that I made.'), types.utf8('https://example.com'), types.uint(10000), types.uint(5), types.uint(20000)], wallet_1)
        ]);
        const result = block.receipts[0].result;
        result.expectErr().expectUint(104);
    },
});

// CANCELING A CAMPAIGN
// a campign owner should be able to cancel a campaign before it starts
Clarinet.test({
    name: "a campign owner should be able to cancel a campaign before it starts",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const wallet_1 = accounts.get("wallet_1")!.address

        let block = chain.mineBlock([
            Tx.contractCall('clearfund', 'launch', [types.utf8('Test Campaign'), types.buff('This is a campaign that I made.'), types.utf8('https://example.com'), types.uint(10000), types.uint(5), types.uint(100)], wallet_1)
        ]);

        let block2 = chain.mineBlock([
            Tx.contractCall('clearfund', 'cancel', [types.uint(1)], wallet_1)
        ])

        const cancelledCampaign = block2.receipts[0].result;
        cancelledCampaign.expectOk();

        const newCampaign = chain.callReadOnlyFn(
            'clearfund',
            'get-campaign',
            [types.uint(1)],
            wallet_1
        );

        assertEquals(newCampaign.result, '(err u105)');
    },
});

// a campaign owner should not be able to cancel a campaign after it starts
Clarinet.test({
    name: "a campaign owner should not be able to cancel a campaign after it starts",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const wallet_1 = accounts.get("wallet_1")!.address

        let block = chain.mineBlock([
            Tx.contractCall('clearfund', 'launch', [types.utf8('Test Campaign'), types.buff('This is a campaign that I made.'), types.utf8('https://example.com'), types.uint(10000), types.uint(2), types.uint(100)], wallet_1)
        ]);

        chain.mineEmptyBlockUntil(5)

        let block2 = chain.mineBlock([
            Tx.contractCall('clearfund', 'cancel', [types.uint(1)], wallet_1)
        ])

        const cancelledCampaign = block2.receipts[0].result;
        cancelledCampaign.expectErr();
    },
});

// a user who does not own a campaign should not be able to cancel it
Clarinet.test({
    name: "a user who does not own a campaign should not be able to cancel it",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const wallet_1 = accounts.get("wallet_1")!.address
        const wallet_2 = accounts.get("wallet_2")!.address

        let block = chain.mineBlock([
            Tx.contractCall('clearfund', 'launch', [types.utf8('Test Campaign'), types.buff('This is a campaign that I made.'), types.utf8('https://example.com'), types.uint(10000), types.uint(5), types.uint(100)], wallet_1)
        ]);

        let block2 = chain.mineBlock([
            Tx.contractCall('clearfund', 'cancel', [types.uint(1)], wallet_2)
        ])

        const cancelledCampaign = block2.receipts[0].result;
        cancelledCampaign.expectErr();
    },
});

// UPDATING A CAMPAIGN
// a campaign owner should be able to update the title, description, and link of a campaign
Clarinet.test({
    name: "a campaign owner should be able to update the title, description, and link of a campaign",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const wallet_1 = accounts.get("wallet_1")!.address

        let block = chain.mineBlock([
            Tx.contractCall('clearfund', 'launch', [types.utf8('Test Campaign'), types.buff('This is a campaign that I made.'), types.utf8('https://example.com'), types.uint(10000), types.uint(2), types.uint(100)], wallet_1)
        ]);

        chain.mineEmptyBlockUntil(5)

        let block2 = chain.mineBlock([
            Tx.contractCall('clearfund', 'update', [types.uint(1), types.utf8("New Title"), types.buff("New description"), types.utf8("https://newexample.org")], wallet_1)
        ])

        const updatedCampaign = chain.callReadOnlyFn(
            'clearfund',
            'get-campaign',
            [types.uint(1)],
            wallet_1
        );

        const expectedCampaign = updatedCampaign.result;
        console.log(expectedCampaign)
        expectedCampaign.expectOk();
        assertEquals(expectedCampaign, '(ok {campaignOwner: ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5, claimed: false, description: 0x4e6577206465736372697074696f6e, endsAt: u100, fundGoal: u10000, link: u"https://newexample.org", pledgedAmount: u0, pledgedCount: u0, startsAt: u2, targetReached: false, targetReachedBy: u0, title: u"New Title"})');
    },
});

// a user who does not own a campaign should not be able to update any information
Clarinet.test({
    name: "a user who does not own a campaign should not be able to update any information",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const wallet_1 = accounts.get("wallet_1")!.address
        const wallet_2 = accounts.get("wallet_2")!.address

        let block = chain.mineBlock([
            Tx.contractCall('clearfund', 'launch', [types.utf8('Test Campaign'), types.buff('This is a campaign that I made.'), types.utf8('https://example.com'), types.uint(10000), types.uint(2), types.uint(100)], wallet_1)
        ]);

        chain.mineEmptyBlockUntil(5)

        let block2 = chain.mineBlock([
            Tx.contractCall('clearfund', 'update', [types.uint(1), types.utf8("New Title"), types.buff("New description"), types.utf8("https://newexample.org")], wallet_2)
        ])

        const expectedCampaign = block2.receipts[0].result

        expectedCampaign.expectErr();
    },
});

// a campaign owner should not be able to update a campaign after it has ended
Clarinet.test({
    name: "a campaign owner should not be able to update a campaign after it has ended",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const wallet_1 = accounts.get("wallet_1")!.address

        let block = chain.mineBlock([
            Tx.contractCall('clearfund', 'launch', [types.utf8('Test Campaign'), types.buff('This is a campaign that I made.'), types.utf8('https://example.com'), types.uint(10000), types.uint(2), types.uint(100)], wallet_1)
        ]);

        chain.mineEmptyBlockUntil(200)

        let block2 = chain.mineBlock([
            Tx.contractCall('clearfund', 'update', [types.uint(1), types.utf8("New Title"), types.buff("New description"), types.utf8("https://newexample.org")], wallet_1)
        ])

        const expectedCampaign = block2.receipts[0].result

        expectedCampaign.expectErr();
    },
});

// CLAIMING CAMPAIGN FUNDS
// a campaign owner should be able to collect funds after the funding goal has been reached
Clarinet.test({
    name: "a campaign owner should be able to collect funds after the funding goal has been reached",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const wallet_1 = accounts.get("wallet_1")!.address
        const wallet_2 = accounts.get("wallet_2")!.address

        let block = chain.mineBlock([
            Tx.contractCall('clearfund', 'launch', [types.utf8('Test Campaign'), types.buff('This is a campaign that I made.'), types.utf8('https://example.com'), types.uint(10000), types.uint(2), types.uint(100)], wallet_1)
        ]);

        chain.mineEmptyBlockUntil(5)

        let block2 = chain.mineBlock([
            Tx.contractCall('clearfund', 'pledge', [types.uint(1), types.uint(20000)], wallet_2)
        ])

        let block3 = chain.mineBlock([
            Tx.contractCall('clearfund', 'claim', [types.uint(1)], wallet_1)
        ])

        const claimedCampaignBlock = block3.receipts[0].result

        claimedCampaignBlock.expectOk();

        const claimedCampaign = chain.callReadOnlyFn(
            'clearfund',
            'get-campaign',
            [types.uint(1)],
            wallet_1
        );

        const expectedCampaign = claimedCampaign.result;
        expectedCampaign.expectOk();
        assertEquals(expectedCampaign, '(ok {campaignOwner: ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5, claimed: true, description: 0x5468697320697320612063616d706169676e20746861742049206d6164652e, endsAt: u100, fundGoal: u10000, link: u"https://example.com", pledgedAmount: u20000, pledgedCount: u1, startsAt: u2, targetReached: true, targetReachedBy: u6, title: u"Test Campaign"})');
    },
});

// a campaign owner should not be able to collect funds before funding goal has been reached
Clarinet.test({
    name: "a campaign owner should not be able to collect funds before funding goal has been reached",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const wallet_1 = accounts.get("wallet_1")!.address

        let block = chain.mineBlock([
            Tx.contractCall('clearfund', 'launch', [types.utf8('Test Campaign'), types.buff('This is a campaign that I made.'), types.utf8('https://example.com'), types.uint(10000), types.uint(2), types.uint(100)], wallet_1)
        ]);

        chain.mineEmptyBlockUntil(5)

        let block2 = chain.mineBlock([
            Tx.contractCall('clearfund', 'claim', [types.uint(1)], wallet_1)
        ])

        const claimedCampaignBlock = block2.receipts[0].result

        claimedCampaignBlock.expectErr();

        const claimedCampaign = chain.callReadOnlyFn(
            'clearfund',
            'get-campaign',
            [types.uint(1)],
            wallet_1
        );

        const expectedCampaign = claimedCampaign.result;
        expectedCampaign.expectOk();
        assertEquals(expectedCampaign, '(ok {campaignOwner: ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5, claimed: false, description: 0x5468697320697320612063616d706169676e20746861742049206d6164652e, endsAt: u100, fundGoal: u10000, link: u"https://example.com", pledgedAmount: u0, pledgedCount: u0, startsAt: u2, targetReached: false, targetReachedBy: u0, title: u"Test Campaign"})');
    },
});

// a campaign owner should not be able to claim funds twice
Clarinet.test({
    name: "a campaign owner should not be able to claim funds twice",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const wallet_1 = accounts.get("wallet_1")!.address
        const wallet_2 = accounts.get("wallet_2")!.address

        let block = chain.mineBlock([
            Tx.contractCall('clearfund', 'launch', [types.utf8('Test Campaign'), types.buff('This is a campaign that I made.'), types.utf8('https://example.com'), types.uint(10000), types.uint(2), types.uint(100)], wallet_1)
        ]);

        chain.mineEmptyBlockUntil(5)

        let block2 = chain.mineBlock([
            Tx.contractCall('clearfund', 'pledge', [types.uint(1), types.uint(20000)], wallet_2)
        ])

        let block3 = chain.mineBlock([
            Tx.contractCall('clearfund', 'claim', [types.uint(1)], wallet_1)
        ])

        const claimedCampaignBlock = block3.receipts[0].result

        claimedCampaignBlock.expectOk();

        const claimedCampaign = chain.callReadOnlyFn(
            'clearfund',
            'get-campaign',
            [types.uint(1)],
            wallet_1
        );

        const expectedCampaign = claimedCampaign.result;
        expectedCampaign.expectOk();
        assertEquals(expectedCampaign, '(ok {campaignOwner: ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5, claimed: true, description: 0x5468697320697320612063616d706169676e20746861742049206d6164652e, endsAt: u100, fundGoal: u10000, link: u"https://example.com", pledgedAmount: u20000, pledgedCount: u1, startsAt: u2, targetReached: true, targetReachedBy: u6, title: u"Test Campaign"})');

        let block4 = chain.mineBlock([
            Tx.contractCall('clearfund', 'claim', [types.uint(1)], wallet_1)
        ])

        const failedClaim = block4.receipts[0].result;
        failedClaim.expectErr();
        assertEquals(failedClaim, '(err u116)')
    },
});

// a user who does not own a campaign should not be able to claim funds
Clarinet.test({
    name: "a user who does not own a campaign should not be able to claim funds",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const wallet_1 = accounts.get("wallet_1")!.address
        const wallet_2 = accounts.get("wallet_2")!.address

        let block = chain.mineBlock([
            Tx.contractCall('clearfund', 'launch', [types.utf8('Test Campaign'), types.buff('This is a campaign that I made.'), types.utf8('https://example.com'), types.uint(10000), types.uint(2), types.uint(100)], wallet_1)
        ]);

        chain.mineEmptyBlockUntil(5)

        let block2 = chain.mineBlock([
            Tx.contractCall('clearfund', 'pledge', [types.uint(1), types.uint(20000)], wallet_2)
        ])

        let block3 = chain.mineBlock([
            Tx.contractCall('clearfund', 'claim', [types.uint(1)], wallet_2)
        ])

        const claimedCampaign = block3.receipts[0].result

        claimedCampaign.expectErr();
        assertEquals(claimedCampaign, '(err u107)');
    },
});

// PLEDGING TO A CAMPAIGN
Clarinet.test({
    name: "pledge: a user should be able to invest in a campaign that is active",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address
        const wallet1 = accounts.get("wallet_1")!.address
        const wallet2 = accounts.get("wallet_2")!.address

        chain.mineBlock([ launch(wallet1) ])
        chain.mineEmptyBlockUntil(40)

        const block = chain.mineBlock([ pledge(wallet2) ])
        block.receipts[0].result.expectOk().expectBool(true)
    },
});

Clarinet.test({
    name: "pledge: the pledged amount should transfer to clearfund contract on successful pledge",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address
        const wallet1 = accounts.get("wallet_1")!.address
        const wallet2 = accounts.get("wallet_2")!.address

        chain.mineBlock([ launch(wallet1) ])
        chain.mineEmptyBlockUntil(40)
        chain.mineBlock([ pledge(wallet2) ])

        const assetsMaps = chain.getAssetsMaps()
        const stxFundsTransferredToClearfund = assetsMaps.assets["STX"][`${deployer}.clearfund`]
        assertEquals(stxFundsTransferredToClearfund, 1000)
    },
});

Clarinet.test({
    name: "pledge: the count of investors should increment when a new investor pledges",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address
        const wallet1 = accounts.get("wallet_1")!.address
        const wallet2 = accounts.get("wallet_2")!.address
        const wallet3 = accounts.get("wallet_3")!.address
        const wallet4 = accounts.get("wallet_4")!.address

        chain.mineBlock([ launch(wallet1) ])
        chain.mineEmptyBlockUntil(40)
        chain.mineBlock([ pledge(wallet2), pledge(wallet3), pledge(wallet4) ])

        const campaign = getCampaign(chain, deployer)
        campaign.result.expectOk().expectTuple()
        assertStringIncludes(campaign.result, "pledgedCount: u3")
    },
});

Clarinet.test({
    name: "pledge: the count of investors should stay the same when an investor pledges again",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address
        const wallet1 = accounts.get("wallet_1")!.address
        const wallet2 = accounts.get("wallet_2")!.address
        const wallet3 = accounts.get("wallet_3")!.address

        chain.mineBlock([ launch(wallet1) ])
        chain.mineEmptyBlockUntil(40)
        chain.mineBlock([ pledge(wallet2), pledge(wallet3), pledge(wallet2), pledge(wallet3) ])

        const campaign = getCampaign(chain, deployer)
        campaign.result.expectOk().expectTuple()
        assertStringIncludes(campaign.result, "pledgedCount: u2")
    },
});

Clarinet.test({
    name: "pledge: the pledged amount should increase when an investor pledges",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address
        const wallet1 = accounts.get("wallet_1")!.address
        const wallet2 = accounts.get("wallet_2")!.address
        const wallet3 = accounts.get("wallet_3")!.address

        chain.mineBlock([ launch(wallet1) ])
        chain.mineEmptyBlockUntil(40)
        chain.mineBlock([ pledge(wallet2), pledge(wallet3), pledge(wallet2), pledge(wallet3) ])

        const campaign = getCampaign(chain, deployer)
        campaign.result.expectOk().expectTuple()
        assertStringIncludes(campaign.result, "pledgedAmount: u4000")
    },
});

Clarinet.test({
    name: "pledge: the pledged mount should should reflect the correct investments by user in investment map ",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address
        const wallet1 = accounts.get("wallet_1")!.address
        const wallet2 = accounts.get("wallet_2")!.address
        const wallet3 = accounts.get("wallet_3")!.address

        chain.mineBlock([ launch(wallet1) ])
        chain.mineEmptyBlockUntil(40)
        chain.mineBlock([ pledge(wallet2), pledge(wallet3), pledge(wallet2), pledge(wallet3), pledge(wallet3) ])

        const investmentWallet2 = getInvestment(chain, wallet2)
        investmentWallet2.result.expectOk().expectSome()
        assertStringIncludes(investmentWallet2.result, "amount: u2000")

        const investmentWallet3 = getInvestment(chain, wallet3)
        investmentWallet3.result.expectOk().expectSome()
        assertStringIncludes(investmentWallet3.result, "amount: u3000")
    },
});

Clarinet.test({
    name: "pledge: a user should not be able to invest in a campaign that was never launched",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address
        const wallet1 = accounts.get("wallet_1")!.address

        const block = chain.mineBlock([ pledge(wallet1) ])
        block.receipts[0].result.expectErr().expectUint(105)
    },
});

Clarinet.test({
    name: "pledge: a user should not be able to invest in a campaign that has not started",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address
        const wallet1 = accounts.get("wallet_1")!.address

        chain.mineBlock([ launch(wallet1) ])
        const block = chain.mineBlock([ pledge(wallet1) ])
        block.receipts[0].result.expectErr().expectUint(108)
    },
});

Clarinet.test({
    name: "pledge: a user should not be able to invest in a campaign that has ended",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address
        const wallet1 = accounts.get("wallet_1")!.address

        chain.mineBlock([ launch(wallet1) ])
        chain.mineEmptyBlockUntil(60)
        const block = chain.mineBlock([ pledge(wallet1) ])
        block.receipts[0].result.expectErr().expectUint(109)
    },
});

Clarinet.test({
    name: "pledge: a user should not be able to pledge 0 STX",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address
        const wallet1 = accounts.get("wallet_1")!.address

        chain.mineBlock([ launch(wallet1) ])
        chain.mineEmptyBlockUntil(40)
        const block = chain.mineBlock([ pledgeAmountEmpty(wallet1) ])
        block.receipts[0].result.expectErr().expectUint(110)
    },
});

Clarinet.test({
    name: "pledge: a user should not be sent an NFT when pledging less than 500 STX",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address
        const wallet1 = accounts.get("wallet_1")!.address
        const wallet2 = accounts.get("wallet_2")!.address

        chain.mineBlock([ launch(wallet1) ])
        chain.mineEmptyBlockUntil(40)
        chain.mineBlock([ pledgeAmountLessThan500(wallet2) ])

        const assetsMaps = chain.getAssetsMaps()
        const nftReceived = assetsMaps.assets[".donorpass.donorpass"]
        assertEquals(nftReceived, undefined)
    },
});

Clarinet.test({
    name: "pledge: a user should be sent an NFT when pledging more than 500 STX",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address
        const wallet1 = accounts.get("wallet_1")!.address
        const wallet2 = accounts.get("wallet_2")!.address

        chain.mineBlock([ launch(wallet1) ])
        chain.mineEmptyBlockUntil(40)
        chain.mineBlock([ pledge(wallet2) ])

        const assetsMaps = chain.getAssetsMaps()
        const nftReceivedByInvestor = assetsMaps.assets[".donorpass.donorpass"][wallet2]
        assertEquals(nftReceivedByInvestor, 1)
    },
});

// UNPLEDGING FROM A CAMPAIGN
Clarinet.test({
    name: "unpledge: a user should be able to unpledge their investment",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address
        const wallet1 = accounts.get("wallet_1")!.address
        const wallet2 = accounts.get("wallet_2")!.address

        chain.mineBlock([ launch(wallet1) ])
        chain.mineEmptyBlockUntil(40)
        const block = chain.mineBlock([ pledge(wallet2), unpledge(wallet2) ])
        block.receipts[1].result.expectOk().expectBool(true)
    },
});

Clarinet.test({
    name: "unpledge: the unpledge amount is deducted from clearfund contract on successful unpledge",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address
        const wallet1 = accounts.get("wallet_1")!.address
        const wallet2 = accounts.get("wallet_2")!.address

        chain.mineBlock([ launch(wallet1) ])
        chain.mineEmptyBlockUntil(40)
        chain.mineBlock([ pledge(wallet2), unpledge(wallet2) ])

        const assetsMaps = chain.getAssetsMaps()
        const stxFundsTransferredToClearfund = assetsMaps.assets["STX"][`${deployer}.clearfund`]
        assertEquals(stxFundsTransferredToClearfund, 500)
    },
});

Clarinet.test({
    name: "unpledge: the amount pledged should decrement by the same amount a user unpledged",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address
        const wallet1 = accounts.get("wallet_1")!.address
        const wallet2 = accounts.get("wallet_2")!.address

        chain.mineBlock([ launch(wallet1) ])
        chain.mineEmptyBlockUntil(40)
        const block = chain.mineBlock([ pledge(wallet2), unpledge(wallet2) ])

        const assetsMaps = chain.getAssetsMaps()
        const stxAmountAfterUnpledge = assetsMaps.assets["STX"][`${deployer}.clearfund`]
        assertEquals(stxAmountAfterUnpledge, 500)

        const campaign = getCampaign(chain, deployer)
        campaign.result.expectOk().expectTuple()
        assertStringIncludes(campaign.result, "pledgedAmount: u500")
    },
});

Clarinet.test({
    name: "unpledge: the pledgedCount should decrement if a user unpledges their entire investment amount",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address
        const wallet1 = accounts.get("wallet_1")!.address
        const wallet2 = accounts.get("wallet_2")!.address

        chain.mineBlock([ launch(wallet1) ])
        chain.mineEmptyBlockUntil(40)
        const block = chain.mineBlock([ pledge(wallet2), unpledgeAll(wallet2) ])
        block.receipts[1].result.expectOk()

        const campaign = getCampaign(chain, deployer)
        campaign.result.expectOk().expectTuple()
        assertStringIncludes(campaign.result, "pledgedCount: u0")
    },
});

Clarinet.test({
    name: "unpledge: the pledgedCount should not decrement if a user unpledges some of their investment amount",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address
        const wallet1 = accounts.get("wallet_1")!.address
        const wallet2 = accounts.get("wallet_2")!.address

        chain.mineBlock([ launch(wallet1) ])
        chain.mineEmptyBlockUntil(40)
        const block = chain.mineBlock([ pledge(wallet2), unpledge(wallet2) ])
        block.receipts[1].result.expectOk()

        const campaign = getCampaign(chain, deployer)
        campaign.result.expectOk().expectTuple()
        assertStringIncludes(campaign.result, "pledgedCount: u1")
    },
});

Clarinet.test({
    name: "unpledge: a user should not be able to unpledge if the campaign has ended",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address
        const wallet1 = accounts.get("wallet_1")!.address
        const wallet2 = accounts.get("wallet_2")!.address

        chain.mineBlock([ launch(wallet1) ])
        chain.mineEmptyBlockUntil(60)
        const block = chain.mineBlock([ pledge(wallet2), unpledge(wallet2) ])
        block.receipts[0].result.expectErr().expectUint(109)
    },
});

Clarinet.test({
    name: "unpledge: a user should not be able to unpledge more than they have pledged",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address
        const wallet1 = accounts.get("wallet_1")!.address
        const wallet2 = accounts.get("wallet_2")!.address

        chain.mineBlock([ launch(wallet1) ])
        chain.mineEmptyBlockUntil(40)
        const block = chain.mineBlock([ pledge(wallet2), unpledgeMoreThanPledged(wallet2) ])

        block.receipts[1].result.expectErr().expectUint(113)
        assertEquals(block.receipts[1].events.length, 0)
    },
});

Clarinet.test({
    name: "unpledge: a user should not be able to unpledge someone else's investment",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address
        const wallet1 = accounts.get("wallet_1")!.address
        const wallet2 = accounts.get("wallet_2")!.address
        const wallet3 = accounts.get("wallet_3")!.address

        chain.mineBlock([ launch(wallet1) ])
        chain.mineEmptyBlockUntil(40)
        chain.mineBlock([ pledge(wallet2) ])

        const assetsMaps = chain.getAssetsMaps()
        const stxFundsTransferredToClearfund = assetsMaps.assets["STX"][`${deployer}.clearfund`]
        assertEquals(stxFundsTransferredToClearfund, 1000)

        const block = chain.mineBlock([ unpledge(wallet3) ])

        const assetsMaps2 = chain.getAssetsMaps()
        const stxFundsTransferredToClearfund2 = assetsMaps2.assets["STX"][`${deployer}.clearfund`]
        assertEquals(stxFundsTransferredToClearfund2, 1000)

        block.receipts[0].result.expectErr().expectUint(112)
    },
});

// REFUND FROM A CAMPAIGN
Clarinet.test({
    name: "refund: a user can get refund from the campaign that has ended and not reached its goal",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address
        const wallet1 = accounts.get("wallet_1")!.address
        const wallet2 = accounts.get("wallet_2")!.address

        chain.mineBlock([ launch(wallet1) ])
        chain.mineEmptyBlockUntil(20)
        chain.mineBlock([ pledge(wallet2) ])
        chain.mineEmptyBlockUntil(60)

        const block = chain.mineBlock([ refund(wallet2) ])
        block.receipts[0].result.expectOk().expectBool(true)
    },
});

Clarinet.test({
    name: "refund: the total amount pledged is refunded to the investor from the campaign on successful refund",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address
        const wallet1 = accounts.get("wallet_1")!.address
        const wallet2 = accounts.get("wallet_2")!.address

        chain.mineBlock([ launch(wallet1) ])
        chain.mineEmptyBlockUntil(20)
        chain.mineBlock([ pledge(wallet2) ])
        chain.mineEmptyBlockUntil(60)

        const assetsMaps = chain.getAssetsMaps()
        const stxFundsClearfundAfterPledge = assetsMaps.assets["STX"][`${deployer}.clearfund`]
        const stxFundsWallet2AfterPledge = assetsMaps.assets["STX"][wallet2]

        chain.mineBlock([ refund(wallet2) ])

        const assetsMaps2 = chain.getAssetsMaps()
        const stxFundsWallet2AfterRefund = assetsMaps2.assets["STX"][wallet2]
        assertEquals(stxFundsWallet2AfterRefund, stxFundsWallet2AfterPledge + stxFundsClearfundAfterPledge)
    },
});

Clarinet.test({
    name: "refund: the investment record is deleted from the investment map on successful refund to the user",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address
        const wallet1 = accounts.get("wallet_1")!.address
        const wallet2 = accounts.get("wallet_2")!.address

        chain.mineBlock([ launch(wallet1) ])
        chain.mineEmptyBlockUntil(20)
        chain.mineBlock([ pledge(wallet2) ])
        chain.mineEmptyBlockUntil(60)

        chain.mineBlock([ refund(wallet2) ])

        const investment = getInvestment(chain, deployer)
        investment.result.expectOk().expectNone()
    },
});

Clarinet.test({
    name: "refund: a user cannot get refund from a campaign that does not exist",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address
        const wallet1 = accounts.get("wallet_1")!.address
        const wallet2 = accounts.get("wallet_2")!.address

        const block = chain.mineBlock([ refund(wallet2) ])
        block.receipts[0].result.expectErr().expectUint(105)
    },
});

Clarinet.test({
    name: "refund: a user cannot get refund from a campaign where the user did not make any pledges",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address
        const wallet1 = accounts.get("wallet_1")!.address
        const wallet2 = accounts.get("wallet_2")!.address

        chain.mineBlock([ launch(wallet1) ])
        chain.mineEmptyBlockUntil(40)

        const block = chain.mineBlock([ refund(wallet2) ])

        block.receipts[0].result.expectErr().expectUint(112)
    },
});

Clarinet.test({
    name: "refund: a user cannot get refund from a campaign that is still active",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address
        const wallet1 = accounts.get("wallet_1")!.address
        const wallet2 = accounts.get("wallet_2")!.address

        chain.mineBlock([ launch(wallet1) ])
        chain.mineEmptyBlockUntil(40)
        chain.mineBlock([ pledge(wallet2) ])

        const block = chain.mineBlock([ refund(wallet2) ])
        block.receipts[0].result.expectErr().expectUint(114)
    },
});

Clarinet.test({
    name: "refund: a user cannot get refund from a campaign that has ended and has reached the goal",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address
        const wallet1 = accounts.get("wallet_1")!.address
        const wallet2 = accounts.get("wallet_2")!.address

        chain.mineBlock([ launch(wallet1) ])
        chain.mineEmptyBlockUntil(20)
        chain.mineBlock([ pledge(wallet2), pledgeAmountGreaterThanGoal(wallet2) ])
        chain.mineEmptyBlockUntil(60)

        const block = chain.mineBlock([ refund(wallet2) ])
        block.receipts[0].result.expectErr().expectUint(115)
    },
});
