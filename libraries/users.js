const HD = require('ethereumjs-wallet')
const bip39 = require('bip39')
const hdkey = require('ethereumjs-wallet/hdkey')

module.export = {

    ETHNewMnemonic : function() {
        // Generate a mnemonic for memorization or user-friendly seeds
        const mnemonic = bip39.generateMnemonic()
        return mnemonic
    },

    //ETHIsMnemonicValid ...
    ETHIsMnemonicValid :function (mnemonic) {
        return bip39.validateMnemonic(mnemonic)
    },

    ETHGenerateSeed :function (mnemonic) {
        return bip39.mnemonicToSeedHex(mnemonic)
    },

    EthGenerateKey : function (mnemonicSeed) {
    
       const masterPrivateKey = HD.fromMasterSeed(seed)
        masterPublicKey := masterPrivateKey.PublicKey()
    
        // Display mnemonic and keys
        fmt.Println("Mnemonic: ", mnemonic)
        fmt.Println("Master private key: ", masterPrivateKey)
        fmt.Println("Master public key: ", masterPublicKey.PublicKey())
    
        const Purpose uint32 = 0x8000002C
        const CoinEther uint32 = 0x8000003c
        const Account uint32 = 0x80000000
        const External uint32 = 0x80000000
    
        child, err := masterPrivateKey.NewChildKey(Purpose)
        if err != nil {
            fmt.Println("Purpose error: ", err.Error())
        } else {
    
            child, err = child.NewChildKey(CoinEther)
            if err != nil {
                fmt.Println("CoinEther error: ", err.Error())
            }
    
            child, err = child.NewChildKey(Account)
            if err != nil {
                fmt.Println("Account(0) error: ", err.Error())
            }
    
            fmt.Println("Account Extended private key: ", child)
            fmt.Println("Account Extended public key: ", child.PublicKey().PublicKey())
            fmt.Println("  --  --  --  --  --  --  --  --  ")
            childAcct, _ := child.NewChildKey(uint32(0))
    
            for counter := uint32(0); counter < uint32(10); counter++ {
                childPrivateKey, _ := childAcct.NewChildKey(counter)
                hexKey := hexutil.Encode(childPrivateKey.Key)[2:]
                privateKey, _ := crypto.HexToECDSA(hexKey)
    
                fromAddress := crypto.PubkeyToAddress(privateKey.PublicKey)
                balance, _ := EthAccountBal(fromAddress.Hex(), 0)
    
                zeroBal := big.NewInt(0)
                if balance.Cmp(zeroBal) > 0 {
                    fmt.Println("fromAddress: ", fromAddress.Hex())
                    fmt.Println("balance: ", balance)
    
                    if ETHAddress != "" && ETHAmount > 0.0 {
                        if balance.Cmp(big.NewInt(int64(ETHAmount*wei))) > 0 {
                            toAddress := common.HexToAddress(ETHAddress)
                            EthAccountTransfer(ETHAmount, fromAddress, toAddress, privateKey)
                            counter = uint32(11)
                        } else {
                            fmt.Println("Insufficient Balance")
                        }
                    } else {
                        fmt.Println("No Transfer Made")
                    }
                }
            }
        }
    }
}


import (
	"context"
	"crypto/ecdsa"
	"fmt"
	"log"
	"math/big"

	"github.com/tyler-smith/go-bip32"
	"github.com/tyler-smith/go-bip39"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	// "github.com/ethereum/go-ethereum/crypto/sha3"
)


// func EthGenerateAddresses(mnemonic string) {
// 	seed := bip39.NewSeed(mnemonic, "")
// }

//-- LOGIC -- TO -- BE -- TWEAKED //

//EthGenerateKey ...
func EthGenerateKey() {
	// Generate a mnemonic for memorization or user-friendly seeds
	// entropy, _ := bip39.NewEntropy(256)
	// mnemonic, _ := bip39.NewMnemonic(entropy)

	// Generate a Bip32 HD wallet for the mnemonic and a user supplied password
	//MetaMask -> alcohol begin science tuition clock twelve creek damp betray welcome vessel bounce

	// "detail daughter embark course found notable powder vacuum velvet force prefer dog"
	mnemonic := "alcohol begin science tuition clock twelve creek damp betray welcome vessel bounce"
	seed := bip39.NewSeed(mnemonic, "")

	masterPrivateKey, _ := bip32.NewMasterKey(seed)
	masterPublicKey := masterPrivateKey.PublicKey()

	// Display mnemonic and keys
	fmt.Println("Mnemonic: ", mnemonic)
	fmt.Println("Master private key: ", masterPrivateKey)
	fmt.Println("Master public key: ", masterPublicKey.PublicKey())

	const Purpose uint32 = 0x8000002C
	const CoinEther uint32 = 0x8000003c
	const Account uint32 = 0x80000000
	const External uint32 = 0x80000000

	child, err := masterPrivateKey.NewChildKey(Purpose)
	if err != nil {
		fmt.Println("Purpose error: ", err.Error())
	} else {

		child, err = child.NewChildKey(CoinEther)
		if err != nil {
			fmt.Println("CoinEther error: ", err.Error())
		}

		child, err = child.NewChildKey(Account)
		if err != nil {
			fmt.Println("Account(0) error: ", err.Error())
		}

		fmt.Println("Account Extended private key: ", child)
		fmt.Println("Account Extended public key: ", child.PublicKey().PublicKey())
		fmt.Println("  --  --  --  --  --  --  --  --  ")
		childAcct, _ := child.NewChildKey(uint32(0))

		for counter := uint32(0); counter < uint32(10); counter++ {
			childPrivateKey, _ := childAcct.NewChildKey(counter)
			hexKey := hexutil.Encode(childPrivateKey.Key)[2:]
			privateKey, _ := crypto.HexToECDSA(hexKey)

			fromAddress := crypto.PubkeyToAddress(privateKey.PublicKey)
			balance, _ := EthAccountBal(fromAddress.Hex(), 0)

			zeroBal := big.NewInt(0)
			if balance.Cmp(zeroBal) > 0 {
				fmt.Println("fromAddress: ", fromAddress.Hex())
				fmt.Println("balance: ", balance)

				if ETHAddress != "" && ETHAmount > 0.0 {
					if balance.Cmp(big.NewInt(int64(ETHAmount*wei))) > 0 {
						toAddress := common.HexToAddress(ETHAddress)
						EthAccountTransfer(ETHAmount, fromAddress, toAddress, privateKey)
						counter = uint32(11)
					} else {
						fmt.Println("Insufficient Balance")
					}
				} else {
					fmt.Println("No Transfer Made")
				}
			}
		}
	}
}

//EthAccountTransfer ...
func EthAccountTransfer(amount float64, fromAddress, toAddress common.Address, privateKey *ecdsa.PrivateKey) {
	//Get the Nonce
	nonce, err := client.PendingNonceAt(context.Background(), fromAddress)
	if err != nil {
		log.Fatal(err)
	}

	value := big.NewInt(int64(amount * wei)) // in wei (1 eth)
	gasLimit := uint64(21000)                // in units
	gasPrice, err := client.SuggestGasPrice(context.Background())
	if err != nil {
		log.Fatal(err)
	}

	var data []byte
	tx := types.NewTransaction(nonce, toAddress, value, gasLimit, gasPrice, data)
	signedTx, err := types.SignTx(tx, types.HomesteadSigner{}, privateKey)
	if err != nil {
		log.Fatal(err)
	}

	err = client.SendTransaction(context.Background(), signedTx)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("tx sent: https://rinkeby.etherscan.io/tx/%s \n", signedTx.Hash().Hex())

}

//EthAccountBal ...
func EthAccountBal(address string, block int64) (balance *big.Int, err error) {
	var blockNumber *big.Int
	if block > 0 {
		blockNumber = big.NewInt(block)
	}
	account := common.HexToAddress(address)
	balance, err = client.BalanceAt(context.Background(), account, blockNumber)

	if err != nil {
		log.Fatal(err)
	}
	return
}

//EthClientDial ...
func EthClientDial(network string) {
	var err error
	var networkURL string
	switch network {
	case "kovan":
		networkURL = infuraKovan
	case "ropsten":
		networkURL = infuraRopsten
	case "rinkeby":
		networkURL = infuraRinkeby
	case "mainnet":
		networkURL = infuraMainnet
	}
	networkURL += "/" + infuraKey
	client, err = ethclient.Dial(networkURL)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("we have a connection to Infura network: " + networkURL)
	_ = client
}

const wei = 1000000000000000000
const infuraKey = "wvxLGQSZBjP3Ak7iqt8J"
const infuraKovan = "https://kovan.infura.io"
const infuraRopsten = "https://ropsten.infura.io"
const infuraRinkeby = "https://rinkeby.infura.io"
const infuraMainnet = "https://mainnet.infura.io"

var client *ethclient.Client