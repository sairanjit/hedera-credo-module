import type { DependencyManager, Module } from '@credo-ts/core'
import type { HederaModuleConfigOptions } from './HederaModuleConfig'

import { AgentConfig } from '@credo-ts/core'

import { HederaModuleConfig } from './HederaModuleConfig'
import { HederaLedgerService } from './ledger'

export class HederaModule implements Module {
  public readonly config: HederaModuleConfig

  public constructor(config: HederaModuleConfigOptions) {
    this.config = new HederaModuleConfig(config)
  }

  public register(dependencyManager: DependencyManager) {
    // Register config
    dependencyManager.registerInstance(HederaModuleConfig, this.config)

    dependencyManager.registerSingleton(HederaLedgerService)
  }
}
