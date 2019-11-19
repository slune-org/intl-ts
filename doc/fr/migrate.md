# Migrer depuis une v3 ou antérieure vers une v4

Si vous utilisiez une version antérieure de la bibliothèque, voici ici les quelques modifications à faire pour passer à la version 4.

# Intl

## La méthode \$withPreferences a été supprimée

La méthode `$withPreferences(preferences: ReadonlyArray<string>, createGenerics: boolean = true): Intl<T>`, déjà dépréciée depuis la version 3, a été supprimée. Il faut maintenant créer un nouvel objet avec le constructeur `new Intl<T>(intl: Intl<T>, preferences: ReadonlyArray<string>, createGenerics: boolean)`.

Exemple :

```diff
-t = t.$withPreferences(preferences, createGenerics);
+t = new Intl(t, preferences, createGenerics);
```

# LanguageMap

## La propriété js a été supprimée

La propriété `js` qui renvoyait une représentation de l'objet sous forme d'une chaine de caractères en `Javascript`, a été supprimée au profit de la méthode `toString(langs?: string[]): string` utilisée sans paramètre. Notez que la langue par défaut n'est plus dupliquée, mais signalée conformément à la nouvelle façon de gérer la langue par défaut (voir ci-dessous).

Exemple :

```diff
-const script = `window.messages = ${messageMap.js};`;
+const script = `window.messages = ${messageMap.toString()};`;
```

## La propriété default n'a plus la même signification

La propriété `default` renvoie maintenant le code de la langue qui est utilisée par défaut et non plus les messages associés à la langue par défaut. Si vous avez besoin des messages par défaut, il faut utiliser maintenant la version sans paramètre de la méthode `messages(): Readonly<T>`.

Exemple :

```diff
-messages = langMap.default;
+messages = langMap.messages();
```

## Les messages sont maintenant en lecture seulement

La méthode `messages(lang: string): Readonly<PartialMessages<T>>` (ou `messages(): Readonly<T>`) renvoie les messages dans une langue donnée ou la langue par défaut. Les messages renvoyés sont directement ceux en mémoire, ce qui pourrait permettre de les modifier. Ceci n'est pas prévu par la bibliothèque, et pour éviter que cela ne se produise, le type de retour de cette méthode est désormais indiqué comme `Readonly`.

## Le nom de la langue est obligatoire

Les messages passés au constructeur doivent obligatoirement, pour chaque langue, posséder une entrée `$` contenant le nom de la langue, en général dans la langue elle-même.

Il en est de même pour la méthode `merge<A extends Messages>(additional: { [key: string]: Partial<A> }): LanguageMap<T & A>` qui lèvera une exception si le paramètre `additional` contient une langue qui n'est pas déjà dans l'objet initial et ne contient pas l'entrée `$`.

Exemple :

```diff
 const en = {
+  $: 'English',
   welcome: 'Welcome here!',
```

## La langue par défaut n'est plus gérée de la même façon

Dans les versions précédentes, si un code langue lui était fourni, la langue par défaut était dupliquée à l'intérieur de l'objet. Désormais, la langue par défaut est signalée en interne par la chaine de caractère `default` à la place des messages de langue. Notez bien qu'une seule langue doit être signalée ainsi ; une exception sera levée le cas contraire. La représentation sous forme de chaine de caractère (voir ci-dessus) tient compte de cette nouvelle façon de faire.

Exemple :

```diff
 const langMapDefinition = {
   default: en,
-  en,
+  en: 'default',
   fr,
```

La langue par défaut doit obligatoirement contenir tous les messages disponibles dans les autres langues. Une exception sera levée par la méthode `merge<A extends Messages>(additional: { [key: string]: Partial<A> }): LanguageMap<T & A>` si vous tentez d'ajouter une entrée dans une autre langue alors qu'elle n'existe pas dans la langue par défaut.
