import { LocalAccountSigner, arbitrumSepolia } from "@alchemy/aa-core";
import Example from "../artifacts/Example.json";
import dotenv from "dotenv";
import { createModularAccountAlchemyClient } from "@alchemy/aa-alchemy";
import { Hex, encodeFunctionData } from "viem";

dotenv.config();

const { abi } = Example["contracts"]["contracts/Example.sol:Example"];

const privateKey = require("crypto").randomBytes(32).toString("hex");
// signer (userop) -> bundler eoa (transaction [userop,userop]) -> EP -> sca -> contract
const signer = LocalAccountSigner.privateKeyToAccountSigner(`0x${privateKey}`);

const contractAddr: Hex = "0x7920b6d8b07f0b9a3b96f238c64e022278db1419";

(async () => {
  // modular account client
  const client = await createModularAccountAlchemyClient({
    apiKey: process.env.API_KEY!,
    chain: arbitrumSepolia,
    signer,
    gasManagerConfig: {
      policyId: process.env.POLICY_ID!,
    },
  });

  const uos = [1, 2, 3, 4, 5, 6, 7].map((x) => {
    return {
      target: contractAddr,
      data: encodeFunctionData({
        abi,
        functionName: "changeX",
        args: [x],
      }),
    };
  });

  const result = await client.sendUserOperation({
    uo: uos,
  });
  const txHash = await client.waitForUserOperationTransaction(result);
  console.log(txHash);

  const x = await client.readContract({
    abi,
    address: contractAddr,
    functionName: "x",
  });

  console.log(x);
})();
