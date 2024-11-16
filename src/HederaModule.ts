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
    // Warn about experimental module
    dependencyManager
      .resolve(AgentConfig)
      .logger.warn(
        "The 'hedera-credo-module' module is experimental and could have unexpected breaking changes. When using this module, make sure to use strict versions for all @credo-ts packages."
      )

    // Register config
    dependencyManager.registerInstance(HederaModuleConfig, this.config)

    dependencyManager.registerSingleton(HederaLedgerService)
  }
}
