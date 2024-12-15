import type {
  Buffer,
  AgentContext,
  DidCreateOptions,
  DidCreateResult,
  DidDeactivateOptions,
  DidDeactivateResult,
  DidRegistrar,
  DidUpdateOptions,
  DidUpdateResult,
} from '@credo-ts/core'

import {
  DidDocument,
  DidDocumentRole,
  DidRecord,
  DidRepository,
  JsonTransformer,
  KeyType,
  TypedArrayEncoder,
} from '@credo-ts/core'
import { HederaLedgerService } from '../ledger'

export class HederaDidRegistrar implements DidRegistrar {
  public readonly supportedMethods = ['hedera']

  public async create(agentContext: AgentContext, options: HederaDidCreateOptions): Promise<DidCreateResult> {
    const didRepository = agentContext.dependencyManager.resolve(DidRepository)
    const hederaLedgerService = agentContext.dependencyManager.resolve(HederaLedgerService)

    let didDocument: DidDocument

    try {
      const seedBuffer = TypedArrayEncoder.fromString(options.secret.seed)

      await agentContext.wallet.createKey({ keyType: KeyType.Ed25519, privateKey: seedBuffer })

      const hederaDid = await hederaLedgerService.create(seedBuffer)

      const did = await hederaDid.resolve()

      didDocument = JsonTransformer.fromJSON(did.toJsonTree(), DidDocument)

      // Save the did so we know we created it and can issue with it
      const didRecord = new DidRecord({
        did: did.getId(),
        role: DidDocumentRole.Created,
        didDocument,
      })
      await didRepository.save(agentContext, didRecord)

      return {
        didDocumentMetadata: {},
        didRegistrationMetadata: {},
        didState: {
          state: 'finished',
          did: didDocument.id,
          didDocument,
          secret: options.secret,
        },
      }
    } catch (error) {
      agentContext.config.logger.error(`Error registering DID : ${error}`)
      return {
        didDocumentMetadata: {},
        didRegistrationMetadata: {},
        didState: {
          state: 'failed',
          reason: `unknownError: ${error}`,
        },
      }
    }
  }

  public async update(agentContext: AgentContext, options: DidUpdateOptions): Promise<DidUpdateResult> {
    throw new Error('Method not implemented.')
  }

  public async deactivate(agentContext: AgentContext, options: DidDeactivateOptions): Promise<DidDeactivateResult> {
    throw new Error('Method not implemented.')
  }
}

export type SeedString = string

export interface HederaDidCreateOptions extends DidCreateOptions {
  method: 'hedera'
  did?: never
  secret: {
    network: 'mainnet' | 'testnet'
    seed: string
  }
}
