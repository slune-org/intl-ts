# Messages

Cette interface décrit comment écrire les objets contenant les messages pour une langue donnée. Ce type peut être utilisé si des messages sont récupérés depuis une application étrangère (cas d'une extension, par exemple). Dans la plupart des cas le `typeof` langue par défaut sera suffisant.

Il est conseillé de ne pas utiliser de clé commençant par `$` dans les messages, afin d'éviter les conflits avec les mots-clés réservés de `Intl` ; mais il est nécessaire que, pour chaque langue, une entrée `$` soit fournie, avec le nom de la langue. En général, le nom de la langue est spécifiée dans la langue elle-même.

Ne typez pas votre langue par défaut avec `Message`, car dans ce cas, `typeof` retournera `Message` et vous perdrez la vérification spécifique de vos messages. Si la langue par défaut n'est pas écrite comme attendu, une erreur de compilation sera levée lorsque la table de langues sera créée.

# PartialMessages\<T extends Messages>

Ce type peut être utilisé pour indiquer une traduction partielle. Il est similaire à `Partial<T>` sauf que l'entrée `$` est obligatoire.

# LanguageMapDefinition\<T extends Messages>

Cette interface décrit les données d'une table de langues complète. Elle peut être utilisée pour récupérer une table de langues sérialisée, par exemple, lorsqu'une table de langues est transmise par un serveur à un navigateur (cf. [exemples](./examples.md)).

Le paramètre générique `T` représente le type de la langue par défaut.

Notez que la classe `Intl` convertie les code de langue en caractères minuscules et chiffres séparés par des soulignés. Cela signifie que, par exemple, au lieu d'utiliser `no-NO-NY`, vous devriez utiliser `no_no_ny` dans les clés des tables de langues.

Une description de table de langues peut avoir une entrée contenant la chaine de caractères `default` à la place des traductions. Ceci permet d'indiquer que ce code de langue est la langue par défaut.

# LanguageMap\<T extends Messages>

Cette objet contient la table de langues, c'est-à-dire la langue par défaut et toutes les traductions pour toutes les langues.

Le paramètre générique `T` représente le type de la langue par défaut.

## constructor(messages: LanguageMapDefinition\<T>)

Créer une table de langues basée sur une définition (un objet contenant toutes les données de la table de langues, y compris la langue par défaut).

## constructor(messages: T, defaultLang?: string)

Créer une table de langues basée sur les messages par défaut. Si le paramètre `defaultLang` est fourni, les messages par défaut seront également utilisés pour la langue correspondant au nom donné. Cela peut être utile pour que la langue par défaut soit listée parmi les langues disponibles.

## merge\<A extends Messages>(additional: { [key: string]: Partial\<A> }): LanguageMap\<T & A>

Créer une nouvelle table de langues contenant les messages fournis, fusionnés avec la définition actuelle. Le paramètre `additional` fourni des messages qui peuvent potentiellement remplacer des messages existants, créer de nouvelles langues ou même étendre la liste des messages (cas des messages spécifiques pour une extension, par exemple).

La méthode lèvera une exception si le paramètre `additional` contient une langue qui n'existe pas dans l'objet d'origine et ne contient pas l'entrée `$`.

Si un message est donnée dans une langue quelconque alors qu'il n'existe pas dans la langue par défaut, l'entrée sera dupliquée dans la langue par défaut.

## contains(lang: string): boolean

Indiquer si la table de langues contient la langue donnée. Cette méthode ne peut pas être utilisée pour tester l'existence de la langue `default`, mais cette langue (par défaut) est toujours présente.

## availables: string[]

Récupérer la liste des langues disponibles. Ce sont les langues pour lesquels la méthode `contains` renverrait vrai. Ce paramètre est en lecture seulement.

## messages(): Readonly\<T>

Récupérer tous les messages par défaut.

## messages(lang: string): Readonly\<PartialMessages\<T>>

Récupérer tous les messages pour un code de langue donné. Si la langue n'est pas disponible, cela retournera les messages de la langue par défaut.

## default: string | undefined

Récupérer le code de la langue par défaut, si disponible. Ce paramètre est en lecture seulement.

## toString(langs?: string[]): string

Donne une représentation de la table de langues sous forme d'une chaine de caractères. Si le paramètre `langs` est spécifié, seules les langues spécifiées seront totalement représentées. Pour les autres, seul le nom de la langue (entrée `$`) sera représenté dans la chaine. Cela peut être utile dans le cas d'un grand nombre de langues si vous ne souhaitez pas que le serveur envoie toutes les traductions à l'application cliente, mais que vous souhaitez que l'application cliente puisse sélectionner parmi l'ensemble des langues disponibles.

La chaine de caractère est écrite en `JavaScript` légal.

# Intl\<T extends Messages>

Cette classe gère l'objet d'internationalisation. Elle est basée sur une table et des préférences de langues.

Le paramètre générique `T` représente le type de la langue par défaut.

## constructor(languages: LanguageMap\<T>, preferences?: ReadonlyArray\<string>, createGenerics: boolean = true)

Créer un objet d'internationalisation utilisant la table de langues donnée. Si le paramètre `preferences` est fourni, sa valeur sera utilisée pour l'ordre des préférences de langues de l'utilisateur. S'il est vrai, le paramètre `createGenerics` déclenche l'ajout automatique de code de langues plus génériques dans les préférences. Par exemple, si les préférences contiennent `no-NO-NY`, cela ajoutera automatiquement `no-NO` et `no` dans cet ordre après cette entrée. Ce paramètre peut être faux, par exemple dans le cas où l'on utilise les préférences linguistiques du navigateur, puisque l'utilisateur final peut déjà définir des préférences spécifiques et génériques.

Notez que les codes de langue sont formatés en minuscules et chiffres séparés par des soulignés. Cela signifie qu'au lieu de `no-NO-NY`, le code de langue réellement utilisé sera `no_no_ny`. Cela permet de normaliser l'écriture des codes de langue, en utilisant des caractères valides en tant que clés d'objet en TypeScript (évitant l'utilisation de guillemets).

Notez que les noms des messages _ne doivent pas contenir l'un des mots-clés_ de l'API. Afin d'éviter les collision de noms, les méthodes et données de l'API commencent par le caractère \$.

## constructor(intl: Intl\<T>, preferences?: ReadonlyArray\<string>, createGenerics: boolean = true)

Cloner l'objet d'internationalisation donné avec de nouvelles préférences. Autrement dit, cela va créer un nouvel objet d'internationalisation avec la même table de langues que celui fourni, mais de nouvelles préférences. L'utilisation de ce constructeur sera plus rapide que de créer un nouvel objet basé sur la table de langues, car les méthodes des messages seront copiées plutôt que d'être re-créées.

## \$changePreferences(preferences: ReadonlyArray\<string>, createGenerics: boolean = true): this

Modifier les préférences linguistique de cet objet d'internationalisation. C'est la seule méthode qui modifie l'état de l'objet. Si vous avez besoin d'utiliser un objet immuable, utilisez plutôt le constructeur de copie (voir ci-dessus).

Si la bibliothèque MobX peut être chargée, cette méthode deviend automatiquement une action, permettant de ne pas lever d'exception même avec MobX en mode strict.

## \$preferences: ReadonlyArray\<string>

Les préférences réellement utilisées par l'objet. Seules les langues trouvées dans la table de langues sont conservées. Ce paramètre est en lecture seulement.

Si la bibliothèque MobX peut être chargée, cette propriété sera automatiquement observable. Comme elle est lue à chaque fois qu'un message est affiché, cela veut dire que tous les observateurs qui affichent des chaines de caractères seront automatiquement rafraichis lorsque les préférences seront modifiées.

## \$languageMap: LanguageMap\<T>

Récupérer la table de langues utilisée. Ce paramètre est en lecture seulement.

## \$getMessageFunction\<K extends keyof T>(name: K): MessageFunction\<T[K]>

Récupérer le message correspondant au nom donné dans la langue la plus appropriée. Ce message est transformé en fonction s'il s'agit d'une chaine de caractère.

## Toutes les entrées de la langue par défaut

Construire le message correspondant au nom de la fonction avec les paramètres donnés (dont le type est contrôlé) dans la langue la plus appropriée.

Notez que les noms des messages _ne doivent pas contenir l'un des mots-clés_ de l'API. Afin d'éviter les collision de noms, les méthodes et données de l'API commencent par le caractère \$.
