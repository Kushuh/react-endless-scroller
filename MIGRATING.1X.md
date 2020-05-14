# Migrating from 1.x versions

As a main update, and considering the component is still in early development phase, I took the 2.0 opportunity to upgrade some namings.
No core functionality has been removed, and backward compatibility will be kept until 3.0.

## Renames

| 1.x | 2.x |
| :---: | :---: |
| feed.search() | feed.feed() |

## Refactors

The following functions don't accept the same parameters anymore. To keep using the old version, add a '_' prefix to the function name.

| function | 1.x params | 2.x params |
| :--- | :--- | :--- |
| feed.insertTuples() | scrollElement, tuples, index | {scrollElement, tuples, index} |
| feed.removeTuples() | scrollElement, ...ids | {scrollElement, ids} |
