import { isAscii } from "./is_ascii.ts";
import { isChar } from "./is_char.ts";
import { isControl } from "./is_control.ts";
import { isDigit } from "./is_digit.ts";
import { isLatin1 } from "./is_latin1.ts";
import { isLetter } from "./is_letter.ts";
import { isLetterOrDigit } from "./is_letter_or_digit.ts";
import { isLower } from "./is_lower.ts";
import { isPunc } from "./is_punc.ts";
import { isSpace } from "./is_space.ts";
import { isSymbol } from "./is_symbol.ts";
import { isUpper } from "./is_upper.ts";
import { equalFold, simpleFold } from "./simple_fold.ts";
import { toLower } from "./to_lower.ts";
import { toUpper } from "./to_upper.ts";
export * from "./types.ts";

export {
    equalFold,
    isAscii,
    isChar,
    isControl,
    isDigit,
    isLatin1,
    isLetter,
    isLetterOrDigit,
    isLower,
    isPunc,
    isSpace,
    isSymbol,
    isUpper,
    simpleFold,
    toLower,
    toUpper,
};

export default {
    equalFold,
    isAscii,
    isChar,
    isControl,
    isDigit,
    isLatin1,
    isLetter,
    isLetterOrDigit,
    isLower,
    isPunc,
    isSpace,
    isSymbol,
    simpleFold,
    toLower,
    toUpper,
};
