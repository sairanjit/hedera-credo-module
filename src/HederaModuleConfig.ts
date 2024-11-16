export interface HederaModuleConfigOptions {
  operatorId?: string
  operatorKey?: string
}

export class HederaModuleConfig {
  private options: HederaModuleConfigOptions

  public constructor(options: HederaModuleConfigOptions) {
    this.options = options
  }
}
