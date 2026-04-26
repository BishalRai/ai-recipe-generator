import { defineBackend } from "@aws-amplify/backend";
import { data } from "./data/resource";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { auth } from "./auth/resource";

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  data,
});

// 1. Update the endpoint to the EU region (eu-north-1)
// The bedrock-runtime endpoint for Stockholm is: https://bedrock-runtime.eu-north-1.amazonaws.com
const bedrockDataSource = backend.data.resources.graphqlApi.addHttpDataSource(
  "bedrockDS",
  "https://bedrock-runtime.eu-north-1.amazonaws.com",
  {
    authorizationConfig: {
      // 2. Update signing region to match your deployment region
      signingRegion: "eu-north-1",
      signingServiceName: "bedrock",
    },
  }
);

bedrockDataSource.grantPrincipal.addToPrincipalPolicy(
  new PolicyStatement({
    resources: [
      // The base foundation model (required for cross-region routing)
      "arn:aws:bedrock:*::foundation-model/anthropic.claude-sonnet-4-5-20250929-v1:0",
      // The EU geo cross-region inference profile
      "arn:aws:bedrock:eu-north-1:*:inference-profile/eu.anthropic.claude-sonnet-4-5-20250929-v1:0",
    ],
    actions: ["bedrock:InvokeModel"],
  })
);
