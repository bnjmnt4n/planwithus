import { dump } from "js-yaml";
import type { Block } from "planwithus-lib";

export const displayYaml = (
  block: Pick<Block, "assign" | "match" | "satisfy">
): string => {
  return ["assign", "match", "satisfy"]
    .map((name) => {
      if (name in block) {
        const value = block[name as keyof typeof block];
        if (!value) {
          return "";
        }
        return dump({ [name]: value });
      }
      return "";
    })
    .filter((string) => string)
    .join("\n");
};
