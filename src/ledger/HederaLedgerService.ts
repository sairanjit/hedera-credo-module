import { injectable, type Buffer } from '@credo-ts/core'
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

  public async create(seed: Buffer, publicKey: Buffer) {
    const privateKey = await PrivateKey.fromSeedED25519(seed)

    const hcsDid = new HcsDid({ privateKey, client: this.client })

    const did = await hcsDid.register()

    // TODO: Need to check the multibase encoding support form sdk
    await did.addVerificationMethod({
      controller: did.getIdentifier(),
      id: `${did.getIdentifier()}#key-1`,
      publicKey: PublicKey.fromBytes(publicKey),
      type: 'Ed25519VerificationKey2018',
    })

    // Adding assertionMethod relationship
    await did.addVerificationRelationship({
      controller: did.getIdentifier(),
      id: `${did.getIdentifier()}#key-1`,
      publicKey: PublicKey.fromBytes(publicKey),
      type: 'Ed25519VerificationKey2018',
      relationshipType: 'assertionMethod',
    })

    // Adding authentication relationship
    await did.addVerificationRelationship({
      controller: did.getIdentifier(),
      id: `${did.getIdentifier()}#key-1`,
      publicKey: PublicKey.fromBytes(publicKey),
      type: 'Ed25519VerificationKey2018',
      relationshipType: 'authentication',
    })

    return hcsDid
  }

  public async resolve(did: string) {
    const hcsDid = new HcsDid({ identifier: did, client: this.client })

    const didDocument = await hcsDid.resolve()

    return didDocument
  }
}
