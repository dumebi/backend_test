const solc = require("solc");
const path = require("path");
const fs = require("fs");

const TokenContract = path.join(
  __dirname,
  "../../blockchain/contracts",
  "token.sol"
);
const MessagesLibrary = path.join(
  __dirname,
  "../../blockchain/contracts",
  "libMsgCode.sol"
);
const AuthorizerLib = path.join(
  __dirname,
  "../../blockchain/contracts",
  "libAuthorizer.sol"
);
const OwnerLib = path.join(
  __dirname,
  "../../blockchain/contracts",
  "libOwner.sol"
);
const TokenFuncLib = path.join(
  __dirname,
  "../../blockchain/contracts",
  "libTokenFunc.sol"
);
const TokenScheduleLib = path.join(
  __dirname,
  "../../blockchain/contracts",
  "libTokenScheduler.sol"
);
const TokenUtilsLib = path.join(
  __dirname,
  "../../blockchain/contracts",
  "libUtils.sol"
);
const TokenSafeMathLib = path.join(
  __dirname,
  "../../blockchain/contracts",
  "libSafeMath.sol"
);
const InterfaceIERCs = path.join(
  __dirname,
  "../../blockchain/contracts",
  "iERCs.sol"
);
const InterfaceSharing = path.join(
  __dirname,
  "../../blockchain/contracts",
  "libSharing.sol"
);

const solTokenContract = fs.readFileSync(TokenContract, "utf8");
const solMessagesLibrary = fs.readFileSync(MessagesLibrary, "utf8");
const solAuthorizerLib = fs.readFileSync(AuthorizerLib, "utf8");
const solOwnerLib = fs.readFileSync(OwnerLib, "utf8");
const solTokenFuncLib = fs.readFileSync(TokenFuncLib, "utf8");
const solTokenScheduleLib = fs.readFileSync(TokenScheduleLib, "utf8");
const solSafeMathLib = fs.readFileSync(TokenSafeMathLib, "utf8");
const solIERCsLib = fs.readFileSync(InterfaceIERCs, "utf8");
const solSharingLib = fs.readFileSync(InterfaceSharing, "utf8");

var input = {
  language: "Solidity",
  sources: {
    Ownable: {
      content: solOwnerLib
    },
    MsgCode: {
      content: solMessagesLibrary
    },
    Authorizer: {
      content: solAuthorizerLib
    },
    TokenScheduler: {
      content: solTokenScheduleLib
    },
    TokenFunc: {
      content: solTokenFuncLib
    },
    Token: {
      content: solTokenContract
    }
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    },
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode"]
      }
    }
  }
};

function getImports(dependency) {
  // console.log("Searching for dependency: ", dependency);
  switch (dependency) {
    case "libUtils.sol":
      return { contents: solUtilsLib };
    case "libOwner.sol":
      return { contents: solOwnerLib };
    case "libMsgCode.sol":
      return { contents: solMessagesLibrary };
    case "libAuthorizer.sol":
      return { contents: solAuthorizerLib };
    case "libTokenScheduler.sol":
      return { contents: solTokenScheduleLib };
    case "libTokenFunc.sol":
      return { contents: solTokenFuncLib };
    case "libSafeMath.sol":
      return { contents: solSafeMathLib };
    case "iERCs.sol":
      return { contents: solIERCsLib };
    case "libSharing.sol":
      return { contents: solSharingLib };
    default:
      return { error: "File not found" };
  }
}

var output = JSON.parse(solc.compile(JSON.stringify(input), getImports));

module.exports = {
  compiledTokenContract: output.contracts["Token"]["Token"],
  compiledMessagesLibrary: output.contracts["MsgCode"]["MessagesAndCodes"],
  compiledAuthorizerLib: output.contracts["Authorizer"]["Authorizer"],
  compiledOwnerLib: output.contracts["Ownable"]["Ownable"],
  compiledTokenFuncLib: output.contracts["TokenFunc"]["TokenFunc"],
  compiledTokenScheduleLib: output.contracts["TokenScheduler"]["TokenScheduler"]
};
