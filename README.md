English | [简体中文](./README.zh-CN.md)

Browser plug-in

## Configuration

This project is a browser plug-in, and the relevant configuration information is stored in the `src/config/index.tsx` file. The following describes the configuration items one by one:

| Param          | Effect                                                         |
| --------------- | ------------------------------------------------------------ |
| kFibosChainId  | ChainId                                                        |
| kFOApi | Chain rpc service address                                              |
| chain_name | Chain name
| chain_protocol | Default chain rpc service network protocol, http, https or ws                   |
| chain_host     | Default chain rpc host address   |
| chain_port | Port of the default chain                   |
| chain_chainId | ChainId of the default chain                    |
| create_tunnel     | Create account service address  |

## Install & Usage

> 1. `yarn install`

> 2. `npm run crx` (A service will be started locally, and temporary files will be generated under the dist folder)

### Build

> 1. Run the command **`npm run build-crx`**, the compiled code will be generated in the **`dist`** folder
> 2. If you need a compressed package, please go to the **`zip`** folder and find fibos.zip