import type {
  AgentContext,
  DidCreateOptions,
  DidCreateResult,
  DidDeactivateOptions,
  DidDeactivateResult,
  DidRegistrar,
  DidUpdateOptions,
  DidUpdateResult,
} from '@credo-ts/core'

export class HederaDidRegistrar implements DidRegistrar {
  public readonly supportedMethods = ['hedera']

  public async create(agentContext: AgentContext, options: DidCreateOptions): Promise<DidCreateResult> {
    throw new Error('Method not implemented.')
  }

  public async update(agentContext: AgentContext, options: DidUpdateOptions): Promise<DidUpdateResult> {
    throw new Error('Method not implemented.')
  }

  public async deactivate(agentContext: AgentContext, options: DidDeactivateOptions): Promise<DidDeactivateResult> {
    throw new Error('Method not implemented.')
  }
}
