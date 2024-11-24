export const pC = 1 << 0; // a control character.
export const pP = 1 << 1; // a punctuation character.
export const pN = 1 << 2; // a numeral.
export const pS = 1 << 3; // a symbolic character.
export const pZ = 1 << 4; // a spacing character.
export const pLu = 1 << 5; // an upper-case letter.
export const pLl = 1 << 6; // a lower-case letter.
export const pp = 1 << 7; // a printable character according to Go's definition.
export const pg = pp | pZ; // a graphical character according to the Unicode definition.
export const pLo = pLl | pLu; // a letter that is neither upper nor lower case.
export const pLmask = pLo;

export const latin1 = [
    pC, // '\x00'
    pC, // '\x01'
    pC, // '\x02'
    pC, // '\x03'
    pC, // '\x04'
    pC, // '\x05'
    pC, // '\x06'
    pC, // '\a'
    pC, // '\b'
    pC, // '\t'
    pC, // '\n'
    pC, // '\v'
    pC, // '\f'
    pC, // '\r'
    pC, // '\x0e'
    pC, // '\x0f'
    pC, // '\x10'
    pC, // '\x11'
    pC, // '\x12'
    pC, // '\x13'
    pC, // '\x14'
    pC, // '\x15'
    pC, // '\x16'
    pC, // '\x17'
    pC, // '\x18'
    pC, // '\x19'
    pC, // '\x1a'
    pC, // '\x1b'
    pC, // '\x1c'
    pC, // '\x1d'
    pC, // '\x1e'
    pC, // '\x1f'
    pZ | pp, // ' '
    pP | pp, // '!'
    pP | pp, // '"'
    pP | pp, // '#'
    pS | pp, // '$'
    pP | pp, // '%'
    pP | pp, // '&'
    pP | pp, // '\''
    pP | pp, // '('
    pP | pp, // ')'
    pP | pp, // '*'
    pS | pp, // '+'
    pP | pp, // ','
    pP | pp, // '-'
    pP | pp, // '.'
    pP | pp, // '/'
    pN | pp, // '0'
    pN | pp, // '1'
    pN | pp, // '2'
    pN | pp, // '3'
    pN | pp, // '4'
    pN | pp, // '5'
    pN | pp, // '6'
    pN | pp, // '7'
    pN | pp, // '8'
    pN | pp, // '9'
    pP | pp, // ':'
    pP | pp, // ';'
    pS | pp, // '<'
    pS | pp, // '='
    pS | pp, // '>'
    pP | pp, // '?'
    pP | pp, // '@'
    pLu | pp, // 'A'
    pLu | pp, // 'B'
    pLu | pp, // 'C'
    pLu | pp, // 'D'
    pLu | pp, // 'E'
    pLu | pp, // 'F'
    pLu | pp, // 'G'
    pLu | pp, // 'H'
    pLu | pp, // 'I'
    pLu | pp, // 'J'
    pLu | pp, // 'K'
    pLu | pp, // 'L'
    pLu | pp, // 'M'
    pLu | pp, // 'N'
    pLu | pp, // 'O'
    pLu | pp, // 'P'
    pLu | pp, // 'Q'
    pLu | pp, // 'R'
    pLu | pp, // 'S'
    pLu | pp, // 'T'
    pLu | pp, // 'U'
    pLu | pp, // 'V'
    pLu | pp, // 'W'
    pLu | pp, // 'X'
    pLu | pp, // 'Y'
    pLu | pp, // 'Z'
    pP | pp, // '['
    pP | pp, // '\\'
    pP | pp, // ']'
    pS | pp, // '^'
    pP | pp, // '_'
    pS | pp, // '`'
    pLl | pp, // 'a'
    pLl | pp, // 'b'
    pLl | pp, // 'c'
    pLl | pp, // 'd'
    pLl | pp, // 'e'
    pLl | pp, // 'f'
    pLl | pp, // 'g'
    pLl | pp, // 'h'
    pLl | pp, // 'i'
    pLl | pp, // 'j'
    pLl | pp, // 'k'
    pLl | pp, // 'l'
    pLl | pp, // 'm'
    pLl | pp, // 'n'
    pLl | pp, // 'o'
    pLl | pp, // 'p'
    pLl | pp, // 'q'
    pLl | pp, // 'r'
    pLl | pp, // 's'
    pLl | pp, // 't'
    pLl | pp, // 'u'
    pLl | pp, // 'v'
    pLl | pp, // 'w'
    pLl | pp, // 'x'
    pLl | pp, // 'y'
    pLl | pp, // 'z'
    pP | pp, // '{'
    pS | pp, // '|'
    pP | pp, // '}'
    pS | pp, // '~'
    pC, // '\x7f'
    pC, // '\u0080'
    pC, // '\u0081'
    pC, // '\u0082'
    pC, // '\u0083'
    pC, // '\u0084'
    pC, // '\u0085'
    pC, // '\u0086'
    pC, // '\u0087'
    pC, // '\u0088'
    pC, // '\u0089'
    pC, // '\u008a'
    pC, // '\u008b'
    pC, // '\u008c'
    pC, // '\u008d'
    pC, // '\u008e'
    pC, // '\u008f'
    pC, // '\u0090'
    pC, // '\u0091'
    pC, // '\u0092'
    pC, // '\u0093'
    pC, // '\u0094'
    pC, // '\u0095'
    pC, // '\u0096'
    pC, // '\u0097'
    pC, // '\u0098'
    pC, // '\u0099'
    pC, // '\u009a'
    pC, // '\u009b'
    pC, // '\u009c'
    pC, // '\u009d'
    pC, // '\u009e'
    pC, // '\u009f'
    pZ, // '\u00a0'
    pP | pp, // '¡'
    pS | pp, // '¢'
    pS | pp, // '£'
    pS | pp, // '¤'
    pS | pp, // '¥'
    pS | pp, // '¦'
    pP | pp, // '§'
    pS | pp, // '¨'
    pS | pp, // '©'
    pLo | pp, // 'ª'
    pP | pp, // '«'
    pS | pp, // '¬'
    0, // '\u00ad'
    pS | pp, // '®'
    pS | pp, // '¯'
    pS | pp, // '°'
    pS | pp, // '±'
    pN | pp, // '²'
    pN | pp, // '³'
    pS | pp, // '´'
    pLl | pp, // 'µ'
    pP | pp, // '¶'
    pP | pp, // '·'
    pS | pp, // '¸'
    pN | pp, // '¹'
    pLo | pp, // 'º'
    pP | pp, // '»'
    pN | pp, // '¼'
    pN | pp, // '½'
    pN | pp, // '¾'
    pP | pp, // '¿'
    pLu | pp, // 'À'
    pLu | pp, // 'Á'
    pLu | pp, // 'Â'
    pLu | pp, // 'Ã'
    pLu | pp, // 'Ä'
    pLu | pp, // 'Å'
    pLu | pp, // 'Æ'
    pLu | pp, // 'Ç'
    pLu | pp, // 'È'
    pLu | pp, // 'É'
    pLu | pp, // 'Ê'
    pLu | pp, // 'Ë'
    pLu | pp, // 'Ì'
    pLu | pp, // 'Í'
    pLu | pp, // 'Î'
    pLu | pp, // 'Ï'
    pLu | pp, // 'Ð'
    pLu | pp, // 'Ñ'
    pLu | pp, // 'Ò'
    pLu | pp, // 'Ó'
    pLu | pp, // 'Ô'
    pLu | pp, // 'Õ'
    pLu | pp, // 'Ö'
    pS | pp, // '×'
    pLu | pp, // 'Ø'
    pLu | pp, // 'Ù'
    pLu | pp, // 'Ú'
    pLu | pp, // 'Û'
    pLu | pp, // 'Ü'
    pLu | pp, // 'Ý'
    pLu | pp, // 'Þ'
    pLl | pp, // 'ß'
    pLl | pp, // 'à'
    pLl | pp, // 'á'
    pLl | pp, // 'â'
    pLl | pp, // 'ã'
    pLl | pp, // 'ä'
    pLl | pp, // 'å'
    pLl | pp, // 'æ'
    pLl | pp, // 'ç'
    pLl | pp, // 'è'
    pLl | pp, // 'é'
    pLl | pp, // 'ê'
    pLl | pp, // 'ë'
    pLl | pp, // 'ì'
    pLl | pp, // 'í'
    pLl | pp, // 'î'
    pLl | pp, // 'ï'
    pLl | pp, // 'ð'
    pLl | pp, // 'ñ'
    pLl | pp, // 'ò'
    pLl | pp, // 'ó'
    pLl | pp, // 'ô'
    pLl | pp, // 'õ'
    pLl | pp, // 'ö'
    pS | pp, // '÷'
    pLl | pp, // 'ø'
    pLl | pp, // 'ù'
    pLl | pp, // 'ú'
    pLl | pp, // 'û'
    pLl | pp, // 'ü'
    pLl | pp, // 'ý'
    pLl | pp, // 'þ'
    pLl | pp, // 'ÿ'
];

const LINEAR_MAX = 18;

export function is16(v: Array<number[]>, char: number) {
    if (v.length <= LINEAR_MAX || char <= 255) {
        for (const range of v) {
            const [l, h, stride] = range;
            if (l <= char && char <= h) {
                return stride === 1 || (char - l) % stride === 0;
            }
        }

        return false;
    }

    let lo = 0, hi = v.length;
    while (lo < hi) {
        const mid = lo + hi >> 1;
        const range = v[mid];
        const [l, h, stride] = range;
        if (l <= char && char <= h) {
            return stride === 1 || (char - l) % stride === 0;
        }
        if (char < l) {
            hi = mid;
        } else {
            lo = mid + 1;
        }
    }

    return false;
}

export function is32(v: Array<number[]>, char: number) {
    if (v.length <= LINEAR_MAX) {
        for (const range of v) {
            const [l, h, stride] = range;
            if (l <= char && char <= h) {
                return stride === 1 || (char - l) % stride === 0;
            }
        }

        return false;
    }

    let lo = 0, hi = v.length;
    while (lo < hi) {
        const mid = lo + hi >> 1;
        const range = v[mid];
        const [l, h, stride] = range;
        if (l <= char && char <= h) {
            return stride === 1 || (char - l) % stride === 0;
        }
        if (char < l) {
            hi = mid;
        } else {
            lo = mid + 1;
        }
    }

    return false;
}
