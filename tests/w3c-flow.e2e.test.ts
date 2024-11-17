import { Agent, DidDocument, DidsModule } from '@credo-ts/core'

import { AskarModule, AskarWallet } from '@credo-ts/askar'
import {
  ClaimFormat,
  W3cJsonLdVerifiablePresentation,
  KeyType,
  JsonTransformer,
  W3cCredential,
  CredentialIssuancePurpose,
  vcLibraries,
  W3cPresentation,
  TypedArrayEncoder,
  W3cJsonLdVerifiableCredential,
  ConsoleLogger,
  LogLevel,
  CredoError,
  utils,
} from '@credo-ts/core'
import { agentDependencies } from '@credo-ts/node'
import { ariesAskar } from '@hyperledger/aries-askar-nodejs'

import { HederaDidRegistrar, HederaDidResolver } from '../src'

import { W3C_FIXTURES } from './fixtures'
import { HederaModule } from '../src'
import { LinkedDataProof } from '@credo-ts/core/build/modules/vc/data-integrity/models/LinkedDataProof'

const { jsonldSignatures } = vcLibraries
const { purposes } = jsonldSignatures

const logger = new ConsoleLogger(LogLevel.info)

// ! Add Operator key and id to yse register did options
const operatorId = ''
const operatorKey = ''

// const did = 'did:hedera:testnet:zQDui45JN8tAZyc8aNcgcDp26wPJgVyQnw1wupqaqexKGWgsuMVfgzKmGfyg8fWPt_0.0.5139447'
const did = 'did:hedera:testnet:zGdjMu1hPkjbJXSPPp6RgTptnpYYM9uEkPeNbPhSkXTon_0.0.5139753'
const seed = '11011000010000111011001100010100'
const holderSeed = '00000000000000000000000000holder'

describe('Hedera Module did resolver', () => {
  let aliceAgent: Agent<{ askar: AskarModule; hedera: HederaModule; dids: DidsModule }>
  let aliceWalletId: string
  let aliceWalletKey: string
  let faberAgent: Agent<{ askar: AskarModule; hedera: HederaModule; dids: DidsModule }>
  let faberWalletId: string
  let faberWalletKey: string

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
          registrars: [new HederaDidRegistrar()],
        }),
      },
    })

    await aliceAgent.initialize()

    faberWalletId = utils.uuid()
    faberWalletKey = utils.uuid()

    // Initialize faber
    faberAgent = new Agent({
      config: {
        label: 'faber',
        walletConfig: { id: faberWalletId, key: faberWalletKey },
        logger,
      },
      dependencies: agentDependencies,
      modules: {
        askar: new AskarModule({ ariesAskar }),
        // Add required modules
        hedera: new HederaModule({
          operatorId,
          operatorKey,
        }),
        dids: new DidsModule({
          resolvers: [new HederaDidResolver()],
          registrars: [new HederaDidRegistrar()],
        }),
      },
    })

    await faberAgent.initialize()
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

    if (faberAgent) {
      await faberAgent.shutdown()

      if (faberAgent.wallet.isInitialized && faberAgent.wallet.isProvisioned) {
        await faberAgent.wallet.delete()
      }
    }
  })

  describe('W3C Issuance and Verification', () => {
    let issuerDid: string
    let verificationMethod: string

    beforeAll(async () => {
      const seedBuffer = TypedArrayEncoder.fromString(seed)
      await faberAgent.wallet.createKey({ keyType: KeyType.Ed25519, seed: seedBuffer })

      const didDoc = await faberAgent.dids.resolve(did)
      // console.log('didDoc', didDoc.didDocument?.toJSON())
      issuerDid = did
      verificationMethod = `${issuerDid}#key-1`

      // create did:key for holder
      await aliceAgent.dids.create({
        method: 'key',
        options: {
          keyType: KeyType.Ed25519,
        },
        seed: TypedArrayEncoder.fromString(holderSeed),
      })
    })

    describe('signCredential', () => {
      it('should return a successfully signed credential', async () => {
        const credentialJson = W3C_FIXTURES.TEST_LD_DOCUMENT
        credentialJson.issuer = issuerDid

        const credential = JsonTransformer.fromJSON(credentialJson, W3cCredential)

        const vc = await faberAgent.w3cCredentials.signCredential<ClaimFormat.LdpVc>({
          format: ClaimFormat.LdpVc,
          credential,
          proofType: 'Ed25519Signature2018',
          verificationMethod,
        })

        expect(vc).toBeInstanceOf(W3cJsonLdVerifiableCredential)
        expect(vc.issuer).toEqual(issuerDid)
        expect(Array.isArray(vc.proof)).toBe(false)
        expect(vc.proof).toBeInstanceOf(LinkedDataProof)

        vc.proof = vc.proof as LinkedDataProof
        expect(vc.proof.verificationMethod).toEqual(verificationMethod)
      })

      it('should throw because of verificationMethod does not belong to this wallet', async () => {
        const credentialJson = W3C_FIXTURES.TEST_LD_DOCUMENT
        credentialJson.issuer = issuerDid

        const credential = JsonTransformer.fromJSON(credentialJson, W3cCredential)

        expect(async () => {
          await faberAgent.w3cCredentials.signCredential({
            format: ClaimFormat.LdpVc,
            credential,
            proofType: 'Ed25519Signature2018',
            verificationMethod:
              'did:hedera:testnet:zGdjMu1hPkjbJXSPPp6RgTptnpYYM9uEkPeNbPhSkXTon_0.0.5139619#did-root-key',
          })
        }).rejects.toThrow(CredoError)
      })
    })

    describe('verifyCredential', () => {
      it('should verify the credential successfully', async () => {
        const result = await aliceAgent.w3cCredentials.verifyCredential({
          credential: JsonTransformer.fromJSON(W3C_FIXTURES.TEST_LD_DOCUMENT_SIGNED, W3cJsonLdVerifiableCredential),
          proofPurpose: new purposes.AssertionProofPurpose(),
        })

        expect(result.isValid).toEqual(true)
      })

      it('should fail because of invalid signature', async () => {
        const vc = JsonTransformer.fromJSON(W3C_FIXTURES.TEST_LD_DOCUMENT_BAD_SIGNED, W3cJsonLdVerifiableCredential)
        const result = await aliceAgent.w3cCredentials.verifyCredential({ credential: vc })

        expect(result).toEqual({
          isValid: false,
          error: expect.any(Error),
          validations: {
            vcJs: {
              error: expect.any(Error),
              isValid: false,
              results: expect.any(Array),
            },
          },
        })
      })
    })

    describe('signPresentation', () => {
      it('should successfully create a presentation from single verifiable credential', async () => {
        const presentation = JsonTransformer.fromJSON(W3C_FIXTURES.TEST_VP_DOCUMENT, W3cPresentation)

        const purpose = new CredentialIssuancePurpose({
          controller: {
            id: verificationMethod,
          },
          date: new Date().toISOString(),
        })

        const verifiablePresentation = await faberAgent.w3cCredentials.signPresentation<ClaimFormat.LdpVp>({
          format: ClaimFormat.LdpVp,
          presentation: presentation,
          proofPurpose: purpose,
          proofType: 'Ed25519Signature2018',
          challenge: '7bf32d0b-39d4-41f3-96b6-45de52988e4c',
          domain: 'issuer.example.com',
          verificationMethod: verificationMethod,
        })

        expect(verifiablePresentation).toBeInstanceOf(W3cJsonLdVerifiablePresentation)
      })
    })

    describe('verifyPresentation', () => {
      it('should successfully verify a presentation containing a single verifiable credential', async () => {
        const vp = JsonTransformer.fromJSON(W3C_FIXTURES.TEST_VP_DOCUMENT_SIGNED, W3cJsonLdVerifiablePresentation)
        const result = await faberAgent.w3cCredentials.verifyPresentation({
          presentation: vp,
          challenge: '7bf32d0b-39d4-41f3-96b6-45de52988e4c',
        })
        expect(result.isValid).toBe(true)
      })
    })
  })
})
