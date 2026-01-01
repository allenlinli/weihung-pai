/**
 * Telegram formatting utilities using @grammyjs/parse-mode
 */

export { fmt, bold, italic, code, pre, link } from "@grammyjs/parse-mode";

/**
 * Escape special characters for Telegram MarkdownV2
 * Characters: _ * [ ] ( ) ~ ` > # + - = | { } . ! \
 *
 * Note: Prefer `fmt` template literal for simple cases.
 * This function is useful when building complex formatted strings.
 */
export function escapeMarkdownV2(text: string): string {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, "\\$1");
}
