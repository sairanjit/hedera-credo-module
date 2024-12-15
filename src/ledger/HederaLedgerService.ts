import { type Buffer, injectable } from '@credo-ts/core'
import { HcsDid } from '@hashgraph/did-sdk-js'
import { Client, PrivateKey, PublicKey } from '@hashgraph/sdk'
// biome-ignore lint/style/useImportType: <explanation>
import { HederaModuleConfig } from '../HederaModuleConfig'

@injectable()
export class HederaLedgerService {
  private client: Client

  public constructor(hederaModuleConfig: HederaModuleConfig) {
    const client = Client.forTestnet({ scheduleNetworkUpdate: false })
    if (hederaModuleConfig.options?.operatorId && hederaModuleConfig.options?.operatorKey) {
      client.setOperator(hederaModuleConfig.options.operatorId, hederaModuleConfig.options.operatorKey)
    }
    this.client = client
  }

  public async create(seed: Buffer) {
    const privateKey = await PrivateKey.fromBytes(seed)

    const hcsDid = new HcsDid({ privateKey, client: this.client })

    await hcsDid.register()

    return hcsDid
  }

  public async resolve(did: string) {
    const hcsDid = new HcsDid({ identifier: did, client: this.client })

    const didDocument = await hcsDid.resolve()

    return didDocument
  }
}
