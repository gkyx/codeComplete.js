# codeComplete.js
jQuery-ui plugin to allow intellisense like code completion.
jQuery-ui is a prerequisite for this library.

### Usage
```
$('#input-field').codeComplete(options);
```

### Options
#### context
Code completion suggestion context. Suggestions will be visible according to the hierarchy of this context object.
```
var context = {
  "Animal": {
    "Mammals": ["dog", "cat", "horse"],
    "Birds": ["parrot", "owl", "eagle"]
  },
  "Plant": {
    ...
  }
}

options = {
  context: context
}
```
![image](https://user-images.githubusercontent.com/36572727/196537239-a6939abf-5336-455d-93d1-b6cc1c3c0d14.png)

#### delay
The delay in milliseconds between when a keystroke occurs and when a search is performed. By default, it is 0.
