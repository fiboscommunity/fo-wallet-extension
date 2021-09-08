import Network from '../models/Network'
import Keypair from '../models/Keypair'

export interface IAccountPermission {
  name: string
  authority: string
}

export interface IImportAccountParams {
  keypair: Keypair
  network: Network
  callback: (error: string, accounts: Array<Account>) => void
}

export interface IAuthorization {
  actor: string
  permission: string
}

export interface IActions {
  account: string
  data: string
  name: string
  authorization: Array<IAuthorization>
}

export interface ITransactionPrams {
  actions: Array<IActions>
  delay_sec: number
  expiration: string
  max_cpu_usage_ms: number
  max_net_usage_words: number
  ref_block_num: number
  ref_block_prefix: number
  transaction_extensions: Array<any>
  context_free_actions: Array<any>
}

export interface ISignProviderParams {
  buf: Uint8Array
  sign: (data: Buffer, privateKey: string) => void,
  transaction: ITransactionPrams
  message: Array<IRequestParserResponse>
}

export interface IRequestParserParams {
  fibos: (args: { [key: string]: any }) => any
  signargs: ISignProviderParams
  httpEndpoint: string
  chainId: string
}

export interface IRequestParserResponse {
  data: {[key: string]: any}
  code: string
  ricardian?: any
  type: string
  authorization: Array<IAuthorization>
}

export interface ISignProviderGroup {
  signArgs: ISignProviderParams,
  fibos: (args: { [key: string]: any }) => any,
  httpEndpoint: string,
  chainId: string,
  throwIfNoIdentity: () => void,
  send: (type: string, payload: any) => Promise<any>
  network: Network
}
