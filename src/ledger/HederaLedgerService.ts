import { injectable } from '@credo-ts/core'
import { HcsDid } from '@hashgraph/did-sdk-js'
import { Client } from '@hashgraph/sdk'
// biome-ignore lint/style/useImportType: <explanation>
import { HederaModuleConfig } from '../HederaModuleConfig'

@injectable()
export class HederaLedgerService {
  private client: Client

  public constructor(hederaModuleConfig: HederaModuleConfig) {
    const client = Client.forTestnet({ scheduleNetworkUpdate: false })
    // client.setOperator(hederaModuleConfig.options.operatorId, hederaModuleConfig.options.operatorKey)
    this.client = client
  }

  public async resolve(did: string) {
    const hcsDid = new HcsDid({ identifier: did, client: this.client })

    const didDocument = await hcsDid.resolve()

    return didDocument
  }
}
