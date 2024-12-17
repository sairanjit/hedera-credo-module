# Hedera Credo Module

The Hedera Credo Module is a TypeScript library that integrates the Hedera Consensus Service with the Credo framework, enabling developers to build decentralized applications (dApps) that leverage Hedera's fast, fair, and secure consensus mechanism. It also facilitates Self-Sovereign Identity (SSI) solutions by allowing the creation and resolution of decentralized identifiers (DIDs).

## Features

- **Consensus Integration**: Seamlessly connect your Credo-based applications to the Hedera Consensus Service for verifiable timestamps and fair ordering of events.
- **Scalability**: Utilize Hedera's high throughput and low-latency consensus to build scalable applications.
- **Security**: Benefit from Hedera's enterprise-grade security and decentralized trust model.
- **SSI Enablement**: Support for creating and resolving DIDs, empowering users with control over their digital identities.

## Prerequisites

Before using the Hedera Credo Module, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 18 or higher)
- [pnpm](https://pnpm.io/) (version 9.9.0 or higher)

## Installation

To install the Hedera Credo Module, run:

```bash
pnpm add hedera-credo-module
```

## Usage

### Integrating Hedera in Credo

Here’s an example of how you can initialize an agent using the Hedera Credo Module:

```typescript
import {
  DidsModule,
  CredentialsModule,
  ConnectionsModule,
  Agent,
  ConsoleLogger,
  LogLevel,
} from '@credo-ts/core';
import {
  HederaDidRegistrar,
  HederaDidResolver,
  HederaModule,
} from 'hedera-credo-module';
import { agentDependencies } from '@credo-ts/node';

async function initializeAgent() {
  const agentConfig = {
    label: 'Hedera Agent',
    autoAcceptConnections: true,
    logger: new ConsoleLogger(LogLevel.trace),
  };

  const modules = {
    hedera: new HederaModule({
      operatorId: HEDERA_ACCOUNT_ID,
      operatorKey: HEDERA_PRIVATE_KEY,
    }),
    dids: new DidsModule({
      registrars: [new HederaDidRegistrar()],
      resolvers: [new HederaDidResolver()],
    }),
    connections: new ConnectionsModule(),
    credentials: new CredentialsModule(),
  };

  const agent = new Agent({
    config: agentConfig,
    dependencies: agentDependencies,
    modules,
  });

  await agent.initialize();
  return agent;
}
```

### Using Hedera in Credo

1. **Create a DID:**
   ```typescript
   const did = await agent.dids.create({
     method: 'hedera',
     secret: {
       network: 'testnet',
       seed: '00000000000000000000000111111111',
     },
   });
   console.log(`Created DID: ${did.did}`);
   ```

2. **Import a DID:**
   ```typescript
   const didToImport = 'did:hedera:testnet:your-did';

   await agent.dids.import({
     did: didToImport,
     overwrite: true,
     privateKeys: [
       {
         privateKey: TypedArrayEncoder.fromString('00000000000000000000000111111111'),
         keyType: KeyType.Ed25519,
       },
     ],
   });
   console.log(`Imported DID: ${didToImport}`);
   ```
3. **To Resolve DID**
    ```typescript
      const resolvedDid = await this.agent.dids.resolve(did);
    ```
### Local Development

To use this specific package locally, follow these steps:

1. Build the package:
   ```bash
   pnpm build
   ```

2. Create a tarball using `pnpm pack`:
   ```bash
   pnpm pack
   ```

3. Add the tarball to your project's dependencies:
   ```json
   "dependencies": {
     "hedera-credo-module": "file:./hedera-credo-module-0.0.2.tgz"
   }
   ```

## Scripts

The following scripts are defined in the `package.json` file to help with development:

- **`clean`**: Removes the `build` directory.
- **`build`**: Cleans the project and compiles TypeScript files.
- **`style`**: Checks code style using Biome.
- **`style:fix`**: Automatically fixes code style issues.
- **`test`**: Runs the test suite using Jest.

Run these scripts using `pnpm`, for example:

```bash
pnpm build
```

## Self-Sovereign Identity (SSI)

Self-Sovereign Identity (SSI) is a framework for managing digital identities in a decentralized way. SSI gives individuals complete control over their identity data, enabling them to create, store, and manage credentials without relying on centralized authorities. 

The Hedera Credo Module enhances SSI by leveraging the Hedera Consensus Service for secure, immutable, and timestamped storage of DID operations. This ensures verifiable and tamper-proof identity records, empowering users with trustless identity management solutions.

### Benefits of SSI with Hedera Credo Module:

- **Decentralization**: Eliminates the need for centralized identity providers.
- **Security**: Ensures the integrity of identity data using Hedera’s robust consensus algorithm.
- **Interoperability**: Compatible with existing SSI standards and frameworks like DID and Verifiable Credentials.
- **User Empowerment**: Puts users in control of their identity, reducing dependence on third parties.

## Impact of the Credo Module

The integration of Hedera into the Credo framework has far-reaching implications for decentralized identity and application development:

- **Boosting Hedera Adoption**: By enabling SSI and DID functionalities, the Hedera Credo Module attracts developers and organizations looking to build secure and scalable identity solutions on Hedera’s platform.
- **Simplified dApp Development**: Developers can leverage the combined power of Credo and Hedera to create innovative applications with minimal effort.
- **Ecosystem Growth**: Encourages the adoption of Hedera’s ecosystem by providing a practical and impactful use case in the identity space.
- **Trustless Transactions**: Facilitates tamper-proof and transparent interactions, enhancing trust in decentralized applications.

## Documentation

For detailed information on the Hedera Consensus Service and Credo framework, refer to the following resources:

- [Hedera Consensus Service Documentation](https://docs.hedera.com/hedera)
- [Credo Framework Documentation](https://credo.js.org/)

## Dependencies

This project relies on the following core dependencies:

- `@credo-ts/askar` (v0.5.13)
- `@credo-ts/core` (v0.5.13)
- `@hashgraph/did-sdk-js` (GitHub version)
- `@hashgraph/sdk` (v2.53.0)

### Development Dependencies

- `@biomejs/biome` (v1.9.4)
- `@types/jest` (v29.5.14)
- `jest` (v29.7.0)
- `typescript` (~v5.3.3)

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes. Ensure that your code adheres to the project's coding standards and includes appropriate tests.

## Acknowledgments

Special thanks to the developers and contributors of the Hedera and Credo projects for their continuous efforts in building and maintaining these platforms.

## Resources

- [Hedera Official Website](https://hedera.com/)
- [Credo Official Website](https://credo.js.org/)
