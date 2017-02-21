# nuget-tree

## Installation

Please install the latest version of [node.js](https://nodejs.org).

Then install using [npm](https://www.npmjs.com/package/nuget-tree):

```
> npm install -g nuget-tree
```

## Usage

Navigate to a directory containing a project.config. Then run this command:

```
> nuget-tree
```

This will draw a nice dependency tree for you:

```
packages.config
├─┬ Microsoft.Orleans.OrleansCodeGenerator 1.4.0
│ ├─┬ Microsoft.Orleans.Core 1.4.0
│ │ └── Newtonsoft.Json 9.0.1
│ └─┬ Microsoft.CodeAnalysis.CSharp 1.3.2
│   └─┬ Microsoft.CodeAnalysis.Common 1.3.2
│     └── Microsoft.CodeAnalysis.Analyzers 1.1.0
├─┬ Microsoft.Orleans.OrleansHost 1.4.0
│ ├─┬ Microsoft.Orleans.Core 1.4.0
│ │ └── Newtonsoft.Json 9.0.1
│ └─┬ Microsoft.Orleans.OrleansRuntime 1.4.0
│   ├─┬ Microsoft.Orleans.Core 1.4.0
│   │ └── Newtonsoft.Json 9.0.1
│   ├─┬ Microsoft.Extensions.DependencyInjection 1.0.0
│   │ └── Microsoft.Extensions.DependencyInjection.Abstractions 1.0.0
│   └── Microsoft.Extensions.DependencyInjection.Abstractions 1.0.0
├─┬ Microsoft.Owin.Hosting 3.0.1
│ ├── Owin 1.0
│ └─┬ Microsoft.Owin 3.0.1
│   └── Owin 1.0
└── Nowin 0.23.0
```

Optional parameters:

* `--hideVersion` : hides the package versions
* `--showSystem` : shows the system packages
* `--onlyTopLevel` : lists only the packages at the top level of the tree (i.e. those that are
not depended upon by any other package)

## License

MIT
