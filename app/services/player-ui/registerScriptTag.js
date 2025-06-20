import { adminGraphql } from "../products/graphql.js";

// List all ScriptTags
export async function listScriptTags(admin) {
  const query = `
    {
      scriptTags(first: 100) {
        edges {
          node {
            id
            src
          }
        }
      }
    }
  `;
  const data = await adminGraphql(admin, query);
  return data.scriptTags.edges.map((edge) => edge.node);
}

// Delete a ScriptTag by ID
export async function deleteScriptTag(admin, id) {
  const mutation = `
    mutation scriptTagDelete($id: ID!) {
      scriptTagDelete(id: $id) {
        deletedScriptTagId
        userErrors { field message }
      }
    }
  `;
  await adminGraphql(admin, mutation, { id });
}

// Register ScriptTag only if not present
export async function registerPlaykuScriptTag(admin, scriptUrl) {
  const existing = await listScriptTags(admin);
  const alreadyExists = existing.some((tag) => tag.src === scriptUrl);
  if (alreadyExists) {
    // ScriptTag already present, do nothing
    return;
  }
  // Optionally: Clean up old ScriptTags for other domains
  for (const tag of existing) {
    if (
      tag.src &&
      tag.src.includes("playku-inject.js") &&
      tag.src !== scriptUrl
    ) {
      await deleteScriptTag(admin, tag.id);
    }
  }
  // Register new ScriptTag
  const mutation = `
    mutation scriptTagCreate($input: ScriptTagInput!) {
      scriptTagCreate(input: $input) {
        scriptTag { id src displayScope }
        userErrors { field message }
      }
    }
  `;
  const variables = {
    input: {
      src: scriptUrl,
      displayScope: "ALL",
    },
  };
  const data = await adminGraphql(admin, mutation, variables);
  if (data.scriptTagCreate.userErrors.length) {
    throw new Error(JSON.stringify(data.scriptTagCreate.userErrors));
  }
  return data.scriptTagCreate.scriptTag;
}
