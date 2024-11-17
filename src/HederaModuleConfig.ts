export interface HederaModuleConfigOptions {
  operatorId?: string
  operatorKey?: string
}

export class HederaModuleConfig {
  public readonly options: HederaModuleConfigOptions

  public constructor(options: HederaModuleConfigOptions) {
    this.options = options
  }
}
