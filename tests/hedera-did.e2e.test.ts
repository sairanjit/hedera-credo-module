import { AskarModule } from '@credo-ts/askar'
import { Agent, ConsoleLogger, DidsModule, LogLevel, utils } from '@credo-ts/core'
import { agentDependencies } from '@credo-ts/node'
import { ariesAskar } from '@hyperledger/aries-askar-nodejs'

import { HederaDidResolver, HederaModule } from '../src'

const logger = new ConsoleLogger(LogLevel.info)

const did = 'did:hedera:testnet:zGdjMu1hPkjbJXSPPp6RgTptnpYYM9uEkPeNbPhSkXTon_0.0.5139753'

describe('Hedera Module did resolver', () => {
  let aliceAgent: Agent<{ askar: AskarModule; hedera: HederaModule; dids: DidsModule }>
  let aliceWalletId: string
  let aliceWalletKey: string

  beforeAll(async () => {
    aliceWalletId = utils.uuid()
    aliceWalletKey = utils.uuid()

    // Initialize alice
    aliceAgent = new Agent({
      config: {
        label: 'alice',
        walletConfig: { id: aliceWalletId, key: aliceWalletKey },
        logger,
      },
      dependencies: agentDependencies,
      modules: {
        askar: new AskarModule({ ariesAskar }),
        // Add required modules
        hedera: new HederaModule({}),
        dids: new DidsModule({
          resolvers: [new HederaDidResolver()],
        }),
      },
    })

    await aliceAgent.initialize()
  })

  afterAll(async () => {
    // Wait for messages to flush out
    await new Promise((r) => setTimeout(r, 1000))

    if (aliceAgent) {
      await aliceAgent.shutdown()

      if (aliceAgent.wallet.isInitialized && aliceAgent.wallet.isProvisioned) {
        await aliceAgent.wallet.delete()
      }
    }
  })

  describe('HederaDidResolver', () => {
    it('should resolve a hedera did when valid did is passed', async () => {
      const resolvedDIDDoc = await aliceAgent.dids.resolve(did)

      console.log('resolvedDIDDoc', resolvedDIDDoc.didDocument?.toJSON())
    })
  })
})
