import {
  type AgentContext,
  DidDocument,
  type DidResolutionResult,
  type DidResolver,
  JsonTransformer,
  type ParsedDid,
} from '@credo-ts/core'
import { HederaLedgerService } from '../ledger'

export class HederaDidResolver implements DidResolver {
  public readonly supportedMethods = ['hedera']

  public readonly allowsCaching = true

  public readonly allowsLocalDidRecord = true

  public async resolve(agentContext: AgentContext, did: string, parsed: ParsedDid): Promise<DidResolutionResult> {
    const didDocumentMetadata = {}

    const ledgerService = agentContext.dependencyManager.resolve(HederaLedgerService)
    try {
      const didDoc = await ledgerService.resolve(did)

      return {
        didDocument: JsonTransformer.fromJSON(didDoc.toJsonTree(), DidDocument),
        didDocumentMetadata,
        didResolutionMetadata: {
          contentType: 'application/did+json',
        },
      }
    } catch (error) {
      return {
        didDocument: null,
        didDocumentMetadata,
        didResolutionMetadata: {
          error: 'notFound',
          message: `resolver_error: Unable to resolve did '${did}': ${error}`,
        },
      }
    }
  }
}
