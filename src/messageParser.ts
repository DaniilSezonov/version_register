import config from "./config";

export function findUpdateTypePart(commitMsg: string): string | undefined {
  const pattern = config.pattern;
  const reg = new RegExp(pattern);
  const matched = commitMsg.match(reg);
  return matched ? matched.pop() : undefined;
}