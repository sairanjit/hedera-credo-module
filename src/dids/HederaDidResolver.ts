import type { AgentContext, DidResolutionOptions, DidResolutionResult, DidResolver, ParsedDid } from '@credo-ts/core'

export class HederaDidResolver implements DidResolver {
  public readonly supportedMethods = ['hedera']

  public readonly allowsCaching = true

  allowsLocalDidRecord?: boolean | undefined
  public async resolve(
    agentContext: AgentContext,
    did: string,
    parsed: ParsedDid,
    didResolutionOptions: DidResolutionOptions
  ): Promise<DidResolutionResult> {
    throw new Error('Method not implemented.')
  }
}
