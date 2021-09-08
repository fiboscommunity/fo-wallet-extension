English | [简体中文](./README.zh-CN.md)

浏览器插件

## 配置

本项目为浏览器插件,相关配置信息存放在 `src/config/index.tsx` 文件中，下面对于配置项进行逐一说明：

| 字段名          | 作用                                                         |
| --------------- | ------------------------------------------------------------ |
| kFibosChainId  | 链 Id                                                        |
| kFOApi | 链 rpc 服务地址                                              |
| chain_name | 链名称
| chain_protocol | 默认链 rpc 服务网络协议, http 、 https 或 ws                   |
| chain_host     | 默认链 rpc host 地址   |
| chain_port | 默认链的端口                   |
| chain_chainId | 默认链的 Id                    |
| create_tunnel     | 创建账号服务地址   |

### 安装依赖

> 1. `yarn install`

> 2. `npm run crx`(会自动在本地启动一个服务, 临时文件被生成在dist文件夹下面)

### 打包插件

> 1. 运行命令 **`npm run build-crx`**，会在 **`dist`** 文件夹生成编译好的代码
> 2. 如果需要压缩包，请到 **`zip`** 文件夹下，查找fibos.zip