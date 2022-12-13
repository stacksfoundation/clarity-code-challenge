import { Chain, Tx, types } from 'https://deno.land/x/clarinet@v1.0.6/index.ts';
import { readOnlyCall, transactionCall } from './base.ts'

export function getLastTokenId(chain: Chain, sender: string) {
    return readOnlyCall(chain, sender, "donorpass", "get-last-token-id")
}

export function getOwner(chain: Chain, sender: string, nftId: number) {
    return readOnlyCall(chain, sender, "donorpass", "get-owner", [types.uint(nftId)])
}

export function getTokenUri(chain: Chain, sender: string, nftId: number) {
    return readOnlyCall(chain, sender, "donorpass", "get-token-uri", [types.uint(nftId)])
}

export function mint(sender: string, minter: string) {
    return transactionCall(sender, "donorpass", "mint", [types.principal(minter)])
}

export function transfer(sender: string, receiver: string, nftId: number) {
    return transactionCall(sender, "donorpass", "transfer", [types.uint(nftId), types.principal(sender), types.principal(receiver)])
}
