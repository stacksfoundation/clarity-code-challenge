
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.6/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';
import { launch, pledge } from "../helpers/clearfund.ts"
import { getLastTokenId, mint, transfer, getOwner, getTokenUri } from "../helpers/donorpass.ts"

// tests for transfer functions
Clarinet.test({
    name: "transfer: a user cannot transfer nft if they do not own one",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const sender = accounts.get("deployer")!.address
        const receiver = accounts.get("wallet_1")!.address

        const minedBlock = chain.mineBlock([transfer(sender, receiver, 0)])

        assertEquals(minedBlock.height, 2)
        minedBlock.receipts[0].result.expectErr().expectUint(3)
    }
})

Clarinet.test({
    name: "transfer: a user cannot transfer nft to themselves",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address
        const wallet1 = accounts.get("wallet_1")!.address
        const wallet2 = accounts.get("wallet_2")!.address

        // minting the donorpass
        chain.mineBlock([ launch(wallet1) ])
        chain.mineEmptyBlockUntil(40)
        chain.mineBlock([ pledge(wallet2) ])

        const minedBlock = chain.mineBlock([transfer(wallet2, wallet2, 1)])

        assertEquals(minedBlock.height, 42)
        minedBlock.receipts[0].result.expectErr().expectUint(2)
    }
})

Clarinet.test({
    name: "transfer: a user should be able transfer nft successfully to another recipient",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address
        const wallet1 = accounts.get("wallet_1")!.address
        const wallet2 = accounts.get("wallet_2")!.address
        const wallet3 = accounts.get("wallet_3")!.address

        // minting the donorpass
        const def = chain.mineBlock([ launch(wallet1) ])
        chain.mineEmptyBlockUntil(40)
        const abc = chain.mineBlock([ pledge(wallet2) ])

        const minedBlock = chain.mineBlock([transfer(wallet2, wallet3, 1)])
        assertEquals(minedBlock.height, 42)
        minedBlock.receipts[0].result.expectOk().expectBool(true)

        const theAssetsMaps = chain.getAssetsMaps()
        assertEquals(theAssetsMaps.assets[".donorpass.donorpass"][wallet2], 0)
        assertEquals(theAssetsMaps.assets[".donorpass.donorpass"][wallet3], 1)
    }
})

// tests for mint functions
Clarinet.test({
    name: "mint: a user cannot mint the nft if it is not the clearfund contract",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address
        const wallet1 = accounts.get("wallet_1")!.address

        const responseWhenNothingIsMinted = getLastTokenId(chain, deployer)
        assertEquals(responseWhenNothingIsMinted.result, `(ok u0)`)

        const minedBlock = chain.mineBlock([
            mint(deployer, wallet1)
        ])

        assertEquals(minedBlock.height, 2)
        minedBlock.receipts[0].result.expectErr().expectUint(100)

        const theAssetsMaps = chain.getAssetsMaps()
        const investorNFTCount = theAssetsMaps.assets[".donorpass.donorpass"]
        assertEquals(investorNFTCount, undefined)
    },
});

Clarinet.test({
    name: "mint: only the clearfund contract can mint the nft",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address
        const wallet1 = accounts.get("wallet_1")!.address
        const wallet2 = accounts.get("wallet_2")!.address

        assertEquals(getLastTokenId(chain, deployer).result, `(ok u0)`)

        chain.mineBlock([ launch(wallet1) ])
        chain.mineEmptyBlockUntil(40)
        chain.mineBlock([ pledge(wallet2) ])

        assertEquals(getLastTokenId(chain, deployer).result, `(ok u1)`)

        const theAssetsMaps = chain.getAssetsMaps()
        const investorNFTCount = theAssetsMaps.assets[".donorpass.donorpass"][wallet2]
        assertEquals(investorNFTCount, 1)
    }
});

// tests for readonly functions

Clarinet.test({
    name: "get-last-token-id: a user is able to read the last nft id minted",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address
        const wallet1 = accounts.get("wallet_1")!.address
        const wallet2 = accounts.get("wallet_2")!.address
        const wallet3 = accounts.get("wallet_3")!.address

        assertEquals(getLastTokenId(chain, deployer).result, `(ok u0)`)

        chain.mineBlock([ launch(wallet1) ])
        chain.mineEmptyBlockUntil(40)
        chain.mineBlock([ pledge(wallet2) ])
        chain.mineBlock([ pledge(wallet2) ])
        chain.mineBlock([ pledge(wallet3) ])
        chain.mineBlock([ pledge(wallet3) ])

        assertEquals(getLastTokenId(chain, deployer).result, `(ok u4)`)
    }
})

Clarinet.test({
    name: "get-owner: a user is able to read the owner of the nft",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address
        const wallet1 = accounts.get("wallet_1")!.address
        const wallet2 = accounts.get("wallet_2")!.address
        const wallet3 = accounts.get("wallet_3")!.address

        chain.mineBlock([ launch(wallet1) ])
        chain.mineEmptyBlockUntil(40)
        chain.mineBlock([ pledge(wallet2) ])
        chain.mineBlock([ pledge(wallet3) ])

        assertEquals(getOwner(chain, deployer, 1).result, `(ok (some ${wallet2}))`)
        assertEquals(getOwner(chain, deployer, 2).result, `(ok (some ${wallet3}))`)

    }
})

Clarinet.test({
    name: "get-token-uri: a user is able to read the owner of the nft",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!.address
        const wallet1 = accounts.get("wallet_1")!.address
        const wallet2 = accounts.get("wallet_2")!.address

        chain.mineBlock([ launch(wallet1) ])
        chain.mineEmptyBlockUntil(40)
        chain.mineBlock([ pledge(wallet2) ])

        assertEquals(getTokenUri(chain, deployer, 1).result, `(ok none)`)

    }
})
