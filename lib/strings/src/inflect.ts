/**
 * Inflections
 * Copyright(c) 2011 Ben Lin <ben@dreamerslab.com>
 * MIT Licensed
 *
 * Ported to include additional type info to avoid slow types for jsr
 *
 * @fileoverview
 * A port of inflection-js to node.js module.
 */

/**
 * @description This is a list of nouns that use the same form for both singular and plural.
 *              This list should remain entirely in lower case to correctly match Strings.
 */
const uncountableWords = [
    // 'access',
    "accommodation",
    "adulthood",
    "advertising",
    "advice",
    "aggression",
    "aid",
    "air",
    "aircraft",
    "alcohol",
    "anger",
    "applause",
    "arithmetic",
    // 'art',
    "assistance",
    "athletics",
    // 'attention',

    "bacon",
    "baggage",
    // 'ballet',
    // 'beauty',
    "beef",
    // 'beer',
    // 'behavior',
    "biology",
    // 'billiards',
    "blood",
    "botany",
    // 'bowels',
    "bread",
    // 'business',
    "butter",

    "carbon",
    "cardboard",
    "cash",
    "chalk",
    "chaos",
    "chess",
    "crossroads",
    "countryside",

    // 'damage',
    "dancing",
    // 'danger',
    "deer",
    // 'delight',
    // 'dessert',
    "dignity",
    "dirt",
    // 'distribution',
    "dust",

    "economics",
    "education",
    "electricity",
    // 'employment',
    // 'energy',
    "engineering",
    "enjoyment",
    // 'entertainment',
    "envy",
    "equipment",
    "ethics",
    "evidence",
    "evolution",

    // 'failure',
    // 'faith',
    "fame",
    "fiction",
    // 'fish',
    "flour",
    "flu",
    "food",
    // 'freedom',
    // 'fruit',
    "fuel",
    "fun",
    // 'funeral',
    "furniture",

    "gallows",
    "garbage",
    "garlic",
    // 'gas',
    "genetics",
    // 'glass',
    "gold",
    "golf",
    "gossip",
    // 'grass',
    "gratitude",
    "grief",
    // 'ground',
    "guilt",
    "gymnastics",

    // 'hair',
    "happiness",
    "hardware",
    "harm",
    "hate",
    "hatred",
    "health",
    "heat",
    // 'height',
    "help",
    "homework",
    "honesty",
    "honey",
    "hospitality",
    "housework",
    "humour",
    "hunger",
    "hydrogen",

    "ice",
    "importance",
    "inflation",
    "information",
    // 'injustice',
    "innocence",
    // 'intelligence',
    "iron",
    "irony",

    "jam",
    // 'jealousy',
    // 'jelly',
    "jewelry",
    // 'joy',
    "judo",
    // 'juice',
    // 'justice',

    "karate",
    // 'kindness',
    "knowledge",

    // 'labour',
    "lack",
    // 'land',
    "laughter",
    "lava",
    "leather",
    "leisure",
    "lightning",
    "linguine",
    "linguini",
    "linguistics",
    "literature",
    "litter",
    "livestock",
    "logic",
    "loneliness",
    // 'love',
    "luck",
    "luggage",

    "macaroni",
    "machinery",
    "magic",
    // 'mail',
    "management",
    "mankind",
    "marble",
    "mathematics",
    "mayonnaise",
    "measles",
    // 'meat',
    // 'metal',
    "methane",
    "milk",
    "minus",
    "money",
    // 'moose',
    "mud",
    "music",
    "mumps",

    "nature",
    "news",
    "nitrogen",
    "nonsense",
    "nurture",
    "nutrition",

    "obedience",
    "obesity",
    // 'oil',
    "oxygen",

    // 'paper',
    // 'passion',
    "pasta",
    "patience",
    // 'permission',
    "physics",
    "poetry",
    "pollution",
    "poverty",
    // 'power',
    "pride",
    // 'production',
    // 'progress',
    // 'pronunciation',
    "psychology",
    "publicity",
    "punctuation",

    // 'quality',
    // 'quantity',
    "quartz",

    "racism",
    // 'rain',
    // 'recreation',
    "relaxation",
    "reliability",
    "research",
    "respect",
    "revenge",
    "rice",
    "rubbish",
    "rum",

    "safety",
    // 'salad',
    // 'salt',
    // 'sand',
    // 'satire',
    "scenery",
    "seafood",
    "seaside",
    "series",
    "shame",
    "sheep",
    "shopping",
    // 'silence',
    "sleep",
    // 'slang'
    "smoke",
    "smoking",
    "snow",
    "soap",
    "software",
    "soil",
    // 'sorrow',
    // 'soup',
    "spaghetti",
    // 'speed',
    "species",
    // 'spelling',
    // 'sport',
    "steam",
    // 'strength',
    "stuff",
    "stupidity",
    // 'success',
    // 'sugar',
    "sunshine",
    "symmetry",

    // 'tea',
    "tennis",
    "thirst",
    "thunder",
    "timber",
    // 'time',
    // 'toast',
    // 'tolerance',
    // 'trade',
    "traffic",
    "transportation",
    // 'travel',
    "trust",

    // 'understanding',
    "underwear",
    "unemployment",
    "unity",
    // 'usage',

    "validity",
    "veal",
    "vegetation",
    "vegetarianism",
    "vengeance",
    "violence",
    // 'vision',
    "vitality",

    "warmth",
    // 'water',
    "wealth",
    "weather",
    // 'weight',
    "welfare",
    "wheat",
    // 'whiskey',
    // 'width',
    "wildlife",
    // 'wine',
    "wisdom",
    // 'wood',
    // 'wool',
    // 'work',

    // 'yeast',
    "yoga",

    "zinc",
    "zoology",
];

/**
 * @description These rules translate from the singular form of a noun to its plural form.
 */

const regex = {
    plural: {
        men: new RegExp("^(m|wom)en$", "gi"),
        people: new RegExp("(pe)ople$", "gi"),
        children: new RegExp("(child)ren$", "gi"),
        tia: new RegExp("([ti])a$", "gi"),
        analyses: new RegExp(
            "((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$",
            "gi",
        ),
        databases: new RegExp("(database)s$", "gi"),
        drives: new RegExp("(drive)s$", "gi"),
        hives: new RegExp("(hi|ti)ves$", "gi"),
        curves: new RegExp("(curve)s$", "gi"),
        lrves: new RegExp("([lr])ves$", "gi"),
        aves: new RegExp("([a])ves$", "gi"),
        foves: new RegExp("([^fo])ves$", "gi"),
        movies: new RegExp("(m)ovies$", "gi"),
        aeiouyies: new RegExp("([^aeiouy]|qu)ies$", "gi"),
        series: new RegExp("(s)eries$", "gi"),
        xes: new RegExp("(x|ch|ss|sh)es$", "gi"),
        mice: new RegExp("([m|l])ice$", "gi"),
        buses: new RegExp("(bus)es$", "gi"),
        oes: new RegExp("(o)es$", "gi"),
        shoes: new RegExp("(shoe)s$", "gi"),
        crises: new RegExp("(cris|ax|test)es$", "gi"),
        octopuses: new RegExp("(octop|vir)uses$", "gi"),
        aliases: new RegExp("(alias|canvas|status|campus)es$", "gi"),
        summonses: new RegExp("^(summons|bonus)es$", "gi"),
        oxen: new RegExp("^(ox)en", "gi"),
        matrices: new RegExp("(matr)ices$", "gi"),
        vertices: new RegExp("(vert|ind)ices$", "gi"),
        feet: new RegExp("^feet$", "gi"),
        teeth: new RegExp("^teeth$", "gi"),
        geese: new RegExp("^geese$", "gi"),
        quizzes: new RegExp("(quiz)zes$", "gi"),
        whereases: new RegExp("^(whereas)es$", "gi"),
        criteria: new RegExp("^(criteri)a$", "gi"),
        genera: new RegExp("^genera$", "gi"),
        ss: new RegExp("ss$", "gi"),
        s: new RegExp("s$", "gi"),
    },

    singular: {
        man: new RegExp("^(m|wom)an$", "gi"),
        person: new RegExp("(pe)rson$", "gi"),
        child: new RegExp("(child)$", "gi"),
        drive: new RegExp("(drive)$", "gi"),
        ox: new RegExp("^(ox)$", "gi"),
        axis: new RegExp("(ax|test)is$", "gi"),
        octopus: new RegExp("(octop|vir)us$", "gi"),
        alias: new RegExp("(alias|status|canvas|campus)$", "gi"),
        summons: new RegExp("^(summons|bonus)$", "gi"),
        bus: new RegExp("(bu)s$", "gi"),
        buffalo: new RegExp("(buffal|tomat|potat)o$", "gi"),
        tium: new RegExp("([ti])um$", "gi"),
        sis: new RegExp("sis$", "gi"),
        ffe: new RegExp("(?:([^f])fe|([lr])f)$", "gi"),
        hive: new RegExp("(hi|ti)ve$", "gi"),
        aeiouyy: new RegExp("([^aeiouy]|qu)y$", "gi"),
        x: new RegExp("(x|ch|ss|sh)$", "gi"),
        matrix: new RegExp("(matr)ix$", "gi"),
        vertex: new RegExp("(vert|ind)ex$", "gi"),
        mouse: new RegExp("([m|l])ouse$", "gi"),
        foot: new RegExp("^foot$", "gi"),
        tooth: new RegExp("^tooth$", "gi"),
        goose: new RegExp("^goose$", "gi"),
        quiz: new RegExp("(quiz)$", "gi"),
        whereas: new RegExp("^(whereas)$", "gi"),
        criterion: new RegExp("^(criteri)on$", "gi"),
        genus: new RegExp("^genus$", "gi"),
        s: new RegExp("s$", "gi"),
        common: new RegExp("$", "gi"),
    },
};

const pluralRules: [RegExp, string?][] = [
    // do not replace if its already a plural word
    [regex.plural.men],
    [regex.plural.people],
    [regex.plural.children],
    [regex.plural.tia],
    [regex.plural.analyses],
    [regex.plural.databases],
    [regex.plural.drives],
    [regex.plural.hives],
    [regex.plural.curves],
    [regex.plural.lrves],
    [regex.plural.foves],
    [regex.plural.aeiouyies],
    [regex.plural.series],
    [regex.plural.movies],
    [regex.plural.xes],
    [regex.plural.mice],
    [regex.plural.buses],
    [regex.plural.oes],
    [regex.plural.shoes],
    [regex.plural.crises],
    [regex.plural.octopuses],
    [regex.plural.aliases],
    [regex.plural.summonses],
    [regex.plural.oxen],
    [regex.plural.matrices],
    [regex.plural.feet],
    [regex.plural.teeth],
    [regex.plural.geese],
    [regex.plural.quizzes],
    [regex.plural.whereases],
    [regex.plural.criteria],
    [regex.plural.genera],

    // original rule
    [regex.singular.man, "$1en"],
    [regex.singular.person, "$1ople"],
    [regex.singular.child, "$1ren"],
    [regex.singular.drive, "$1s"],
    [regex.singular.ox, "$1en"],
    [regex.singular.axis, "$1es"],
    [regex.singular.octopus, "$1uses"],
    [regex.singular.alias, "$1es"],
    [regex.singular.summons, "$1es"],
    [regex.singular.bus, "$1ses"],
    [regex.singular.buffalo, "$1oes"],
    [regex.singular.tium, "$1a"],
    [regex.singular.sis, "ses"],
    [regex.singular.ffe, "$1$2ves"],
    [regex.singular.hive, "$1ves"],
    [regex.singular.aeiouyy, "$1ies"],
    [regex.singular.matrix, "$1ices"],
    [regex.singular.vertex, "$1ices"],
    [regex.singular.x, "$1es"],
    [regex.singular.mouse, "$1ice"],
    [regex.singular.foot, "feet"],
    [regex.singular.tooth, "teeth"],
    [regex.singular.goose, "geese"],
    [regex.singular.quiz, "$1zes"],
    [regex.singular.whereas, "$1es"],
    [regex.singular.criterion, "$1a"],
    [regex.singular.genus, "genera"],

    [regex.singular.s, "s"],
    [regex.singular.common, "s"],
];

/**
 * @description These rules translate from the plural form of a noun to its singular form.
 */
const singularRules: [RegExp, string?][] = [
    // do not replace if its already a singular word
    [regex.singular.man],
    [regex.singular.person],
    [regex.singular.child],
    [regex.singular.drive],
    [regex.singular.ox],
    [regex.singular.axis],
    [regex.singular.octopus],
    [regex.singular.alias],
    [regex.singular.summons],
    [regex.singular.bus],
    [regex.singular.buffalo],
    [regex.singular.tium],
    [regex.singular.sis],
    [regex.singular.ffe],
    [regex.singular.hive],
    [regex.singular.aeiouyy],
    [regex.singular.x],
    [regex.singular.matrix],
    [regex.singular.mouse],
    [regex.singular.foot],
    [regex.singular.tooth],
    [regex.singular.goose],
    [regex.singular.quiz],
    [regex.singular.whereas],
    [regex.singular.criterion],
    [regex.singular.genus],

    // original rule
    [regex.plural.men, "$1an"],
    [regex.plural.people, "$1rson"],
    [regex.plural.children, "$1"],
    [regex.plural.databases, "$1"],
    [regex.plural.drives, "$1"],
    [regex.plural.genera, "genus"],
    [regex.plural.criteria, "$1on"],
    [regex.plural.tia, "$1um"],
    [regex.plural.analyses, "$1$2sis"],
    [regex.plural.hives, "$1ve"],
    [regex.plural.curves, "$1"],
    [regex.plural.lrves, "$1f"],
    [regex.plural.aves, "$1ve"],
    [regex.plural.foves, "$1fe"],
    [regex.plural.movies, "$1ovie"],
    [regex.plural.aeiouyies, "$1y"],
    [regex.plural.series, "$1eries"],
    [regex.plural.xes, "$1"],
    [regex.plural.mice, "$1ouse"],
    [regex.plural.buses, "$1"],
    [regex.plural.oes, "$1"],
    [regex.plural.shoes, "$1"],
    [regex.plural.crises, "$1is"],
    [regex.plural.octopuses, "$1us"],
    [regex.plural.aliases, "$1"],
    [regex.plural.summonses, "$1"],
    [regex.plural.oxen, "$1"],
    [regex.plural.matrices, "$1ix"],
    [regex.plural.vertices, "$1ex"],
    [regex.plural.feet, "foot"],
    [regex.plural.teeth, "tooth"],
    [regex.plural.geese, "goose"],
    [regex.plural.quizzes, "$1"],
    [regex.plural.whereases, "$1"],

    [regex.plural.ss, "ss"],
    [regex.plural.s, ""],
];

/**
 * A helper method that applies rules based replacement to a String.
 * @param str String to modify and return based on the passed rules.
 * @param rules Regexp to match paired with String to use for replacement
 * @param skip Strings to skip if they match
 * @param override String to return as though this method succeeded (used to conform to APIs)
 * @returns Return passed String modified by passed rules.
 * @example
 *
 *     applyRules( 'cows', singular_rules ); // === 'cow'
 */
function applyRules(
    str: string,
    rules: [RegExp, string?][],
    skip: string[],
    override?: string,
): string {
    if (override) {
        return override;
    } else {
        if (skip.includes(str.toLocaleLowerCase())) {
            return str;
        }

        for (const rule of rules) {
            if (str.match(rule[0])) {
                if (rule[1] !== undefined) {
                    return str.replace(rule[0], rule[1]);
                }

                return str;
            }
        }
    }

    return str;
}

/**
 * This function adds pluralization support to every String object.
 * @param str The subject string.
 * @param plural Overrides normal output with said String.(optional)
 * @returns Singular English language nouns are returned in plural form.
 * @example
 *
 *     const inflection = require( 'inflection' );
 *
 *     inflection.pluralize( 'person' ); // === 'people'
 *     inflection.pluralize( 'octopus' ); // === 'octopuses'
 *     inflection.pluralize( 'Hat' ); // === 'Hats'
 *     inflection.pluralize( 'person', 'guys' ); // === 'guys'
 */
export function pluralize(str: string, plural?: string): string {
    return applyRules(str, pluralRules, uncountableWords, plural);
}

/**
 * This function adds singularization support to every String object.
 * @param str The subject string.
 * @param singular Overrides normal output with said String.(optional)
 * @returns Plural English language nouns are returned in singular form.
 * @example
 *
 *     const inflection = require( 'inflection' );
 *
 *     inflection.singularize( 'people' ); // === 'person'
 *     inflection.singularize( 'octopuses' ); // === 'octopus'
 *     inflection.singularize( 'Hats' ); // === 'Hat'
 *     inflection.singularize( 'guys', 'person' ); // === 'person'
 */
export function singularize(str: string, singular?: string): string {
    return applyRules(str, singularRules, uncountableWords, singular);
}

/**
 * This function will pluralize or singularlize a String appropriately based on a number value
 * @param str The subject string.
 * @param count The number to base pluralization off of.
 * @param singular Overrides normal output with said String.(optional)
 * @param plural Overrides normal output with said String.(optional)
 * @returns English language nouns are returned in the plural or singular form based on the count.
 * @example
 *
 *     const inflection = require( 'inflection' );
 *
 *     inflection.inflect( 'people' 1 ); // === 'person'
 *     inflection.inflect( 'octopuses' 1 ); // === 'octopus'
 *     inflection.inflect( 'Hats' 1 ); // === 'Hat'
 *     inflection.inflect( 'guys', 1 , 'person' ); // === 'person'
 *     inflection.inflect( 'inches', 1.5 ); // === 'inches'
 *     inflection.inflect( 'person', 2 ); // === 'people'
 *     inflection.inflect( 'octopus', 2 ); // === 'octopuses'
 *     inflection.inflect( 'Hat', 2 ); // === 'Hats'
 *     inflection.inflect( 'person', 2, null, 'guys' ); // === 'guys'
 */
export function inflect(
    str: string,
    count: number,
    singular?: string,
    plural?: string,
): string {
    if (isNaN(count)) {
        return str;
    }

    if (count === 1) {
        return applyRules(str, singularRules, uncountableWords, singular);
    }

    return applyRules(str, pluralRules, uncountableWords, plural);
}
