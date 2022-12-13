import { Chain, Tx} from 'https://deno.land/x/clarinet@v1.0.6/index.ts';

export function readOnlyCall(chain: Chain, sender: string, contract: string, readOnlyFn: string, _arguments: Array<any> = []) {
    return chain.callReadOnlyFn(contract, readOnlyFn, _arguments, sender)
}

export function transactionCall(sender: string, contract: string, fn: string, _arguments: Array<any> = []) {
    return Tx.contractCall(contract, fn, _arguments, sender)
}
