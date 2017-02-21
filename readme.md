# nuget-tree

## Installation

Please install the latest version of [node.js](https://nodejs.org).

Then install using npm:

```
> npm install -g nuget-tree
```

## Usage

Navigate to a project containing a project.config. Then run this command:

```
> nuget-tree
```

Optional parameters:

* `--hideVersion` : hides the package verions
* `--showSystem` : shows the system packages
* `--onlyTopLevel` : lists only the packages at the top level of the tree (i.e. those that are 
depended upon by any other package)


## License

MIT
